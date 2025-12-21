/**
 * ChallengesModal Component
 * Modal for viewing created and played challenges
 */

import { useState, useEffect } from "react";
import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

const ChallengesModal = ({ setShowModal, setMessage }) => {
  const [createdChallenges, setCreatedChallenges] = useState([]);
  const [playedChallenges, setPlayedChallenges] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const created = JSON.parse(localStorage.getItem('createdChallenges') || '[]');
    const played = JSON.parse(localStorage.getItem('playedChallenges') || '[]');
    
    // Filter out expired challenges
    const now = new Date();
    const activeCreated = created.filter(c => {
      const expiresAt = new Date(c.expires_at);
      return expiresAt > now;
    });
    
    setCreatedChallenges(activeCreated);
    setPlayedChallenges(played);
  }, []);

  const handleDeleteChallenge = async (code) => {
    if (!confirm('Are you sure you want to delete this challenge? All results will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/challenges/delete?code=${code}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete challenge');
      }

      // Remove from localStorage
      const created = JSON.parse(localStorage.getItem('createdChallenges') || '[]');
      const updated = created.filter(c => c.code !== code);
      localStorage.setItem('createdChallenges', JSON.stringify(updated));
      setCreatedChallenges(updated.filter(c => {
        const expiresAt = new Date(c.expires_at);
        return expiresAt > new Date();
      }));

      setMessage('Challenge deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setMessage('Failed to delete challenge');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleViewChallenge = (code) => {
    window.location.href = `${window.location.pathname}?challenge=${code}`;
  };

  return (
    <div className={modalsStyles.modalOverlay} onClick={() => setShowModal(false)}>
      <div className={modalsStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.modalHeader}>
          <h2>🎯 Challenges</h2>
          <button
            className={modalsStyles.closeButton}
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className={`${modalsStyles.gamesModalContent} ${modalsStyles.challengesContent}`}>
          {/* Created Challenges */}
          {createdChallenges.length > 0 && (
            <div className={modalsStyles.challengesSection}>
              <h3>Created by You ({createdChallenges.length}/3)</h3>
              <div className={modalsStyles.challengesList}>
                {createdChallenges.map((challenge) => (
                  <div key={challenge.code} className={modalsStyles.challengeItem}>
                    <div className={modalsStyles.challengeInfo}>
                      <div className={modalsStyles.challengeCode}>{challenge.code}</div>
                      <div className={modalsStyles.challengeSettings}>
                        {challenge.settings?.gameType} • {challenge.settings?.mode}
                      </div>
                      <div className={modalsStyles.challengeDate}>
                        {new Date(challenge.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={modalsStyles.challengeActions}>
                      <button
                        className={`${modalsStyles.button} ${sharedStyles.secondaryButton}`}
                        onClick={() => handleViewChallenge(challenge.code)}
                      >
                        View
                      </button>
                      <button
                        className={`${modalsStyles.button} ${modalsStyles.deleteButton}`}
                        onClick={() => handleDeleteChallenge(challenge.code)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Played Challenges */}
          {playedChallenges.length > 0 && (
            <div className={modalsStyles.challengesSection}>
              <h3>You've Played</h3>
              <div className={modalsStyles.challengesList}>
                {playedChallenges.map((challenge) => (
                  <div key={challenge.code} className={modalsStyles.challengeItem}>
                    <div className={modalsStyles.challengeInfo}>
                      <div className={modalsStyles.challengeCode}>{challenge.code}</div>
                      <div className={modalsStyles.challengeScore}>
                        Your Score: {challenge.score}
                      </div>
                      <div className={modalsStyles.challengeDate}>
                        {new Date(challenge.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={modalsStyles.challengeActions}>
                      <button
                        className={`${modalsStyles.button} ${sharedStyles.mainButton}`}
                        onClick={() => handleViewChallenge(challenge.code)}
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {createdChallenges.length === 0 && playedChallenges.length === 0 && (
            <div className={modalsStyles.emptyState}>
              <div className={modalsStyles.emptyStateIcon}>🎯</div>
              <div className={modalsStyles.emptyStateTitle}>No challenges yet</div>
              <div className={modalsStyles.emptyStateDescription}>
                Create a challenge by clicking "Share Challenge" after finishing a game
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengesModal;
