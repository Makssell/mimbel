/**
 * ShareModal Component
 * Modal for sharing game settings or creating challenges
 */

import { useState, useEffect } from "react";
import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

export default function ShareModal({
  isOpen,
  onClose,
  onShareSettings,
  onCreateChallenge,
  playMenuClickSound
}) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Reset success message when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowSuccessMessage(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShareSettings = async () => {
    if (playMenuClickSound) playMenuClickSound();
    await onShareSettings();
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 2000);
  };

  const handleCreateChallenge = () => {
    if (playMenuClickSound) playMenuClickSound();
    onCreateChallenge();
    onClose();
  };

  return (
    <div className={modalsStyles.modalOverlay} onClick={onClose}>
      <div className={modalsStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.modalHeader}>
          <h2>Share Game</h2>
          <button
            className={modalsStyles.closeButton}
            onClick={() => {
              if (playMenuClickSound) playMenuClickSound();
              onClose();
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className={modalsStyles.modalContent}>
          {showSuccessMessage ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '16px',
              padding: '20px 0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontWeight: 500
              }}>
                Link copied to clipboard!
              </p>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Choose how you want to share this game:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
                  onClick={handleShareSettings}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🔗 Share Game Settings
                </button>
                {/* <button
                  className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
                  onClick={handleCreateChallenge}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  🏆 Create Challenge
                </button> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


