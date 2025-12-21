/**
 * ChallengeScreen Component
 * Displays challenge information, leaderboard, and allows starting the challenge
 */

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import sharedStyles from "../styles/shared.module.css";
import challengeScreenStyles from "../styles/challengeScreen.module.css";
import FloatingMenu from "./FloatingMenu";
import { getDivisionTypeNames, areAllDivisionsSelected } from "../utils/gameUtils";

const ChallengeScreen = ({
  challengeData,
  challengeResults,
  hasPlayedChallenge,
  regionalCountries,
  isLoadingRegionalCountries,
  regionalDivisionTypes,
  setShowChallengeScreen,
  setIsChallengeMode,
  setChallengeData,
  setChallengeResults,
  setChallengePlayerName,
  setChallengeScoreSubmitted,
  setMenuStep,
  setGameMode,
  setGameType,
  setRegionalGameType,
  setSelectedRegionalCountry,
  setSelectedDivisionTypes,
  startGame,
  playMenuClickSound,
  setMessage,
  showFloatingMenu,
  setShowFloatingMenu,
  setModalType,
  setShowModal,
  setGamesView
}) => {
  // Loading is handled at the top level, so we can assume challengeData is loaded
  if (!challengeData) {
    return null; // Should not happen, but safety check
  }
  
  const settings = challengeData.game_settings;
  const [previewFlag, setPreviewFlag] = useState(null);
  const [isLoadingPreviewFlag, setIsLoadingPreviewFlag] = useState(false);
  
  // Load preview flag based on game settings
  useEffect(() => {
    const loadPreviewFlag = async () => {
      setIsLoadingPreviewFlag(true);
      try {
        if (settings.gameMode === "Regional Flags" && settings.country) {
          // For regional games, show the country flag
          // Wait for regionalCountries to load if needed
          if (regionalCountries.length === 0 && !isLoadingRegionalCountries) {
            // If not loading and empty, try to find in a different way
            // Check if we can get it from supabase directly
            try {
              const { data: countryData, error } = await supabase
                .from('regional_countries')
                .select('id, name, flag_image_url')
                .eq('name', settings.country)
                .eq('is_active', true)
                .single();
              
              if (!error && countryData && countryData.flag_image_url) {
                setPreviewFlag({
                  image_url: countryData.flag_image_url,
                  name: countryData.name,
                  type: 'country'
                });
                setIsLoadingPreviewFlag(false);
                return;
              }
            } catch (err) {
              console.error('Error fetching country flag:', err);
            }
          } else {
            const country = regionalCountries.find(c => c.name === settings.country);
            if (country && country.flag_image_url) {
              setPreviewFlag({
                image_url: country.flag_image_url,
                name: country.name,
                type: 'country'
              });
              setIsLoadingPreviewFlag(false);
              return;
            }
          }
        } else {
          // For non-regional games, fetch a random flag based on settings
          const continentMap = {
            "World": "world",
            "Africa": "1",
            "Asia": "2",
            "Europe": "3",
            "North America": "4",
            "South America": "5",
            "Oceania": "6"
          };
          
          const selectedContinent = settings.region ? continentMap[settings.region] || "world" : "world";
          const includeTerritories = settings.territories === "Included";
          
          // Use the flagLoader to get flags
          const { loadFlags } = await import('../lib/flagLoader');
          const flags = await loadFlags({
            gameType: "global",
            selectedContinent,
            includeTerritories
          });
          
          if (flags && flags.length > 0) {
            // Pick a random flag
            const randomFlag = flags[Math.floor(Math.random() * flags.length)];
            setPreviewFlag({
              image_url: randomFlag.image_url,
              name: randomFlag.name,
              type: 'flag'
            });
          }
        }
      } catch (error) {
        console.error('Error loading preview flag:', error);
      } finally {
        setIsLoadingPreviewFlag(false);
      }
    };
    
    if (settings) {
      // For regional games, wait for countries to load or try direct fetch
      // For non-regional games, load immediately
      if (settings.gameMode === "Regional Flags") {
        if (regionalCountries.length > 0 || !isLoadingRegionalCountries) {
          loadPreviewFlag();
        }
      } else {
        loadPreviewFlag();
      }
    }
  }, [settings, regionalCountries, isLoadingRegionalCountries]);
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  };
  
  // Get creator name from earliest submission
  // The creator is typically the first to submit, usually within a few seconds of challenge creation
  const getCreatorName = () => {
    if (challengeResults.length === 0) return null;
    
    // Sort results by creation time
    const sortedResults = [...challengeResults].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    const earliestResult = sortedResults[0];
    if (!earliestResult) return null;
    
    // Check if earliest submission is within 5 minutes of challenge creation
    // This helps identify the creator more reliably
    const challengeCreated = new Date(challengeData.created_at);
    const earliestSubmission = new Date(earliestResult.created_at);
    const timeDiff = earliestSubmission - challengeCreated;
    const fiveMinutes = 5 * 60 * 1000;
    
    // If within 5 minutes, likely the creator; otherwise use earliest as fallback
    if (timeDiff >= 0 && timeDiff <= fiveMinutes) {
      return earliestResult.player_name;
    }
    
    // Fallback: use earliest submission anyway
    return earliestResult.player_name;
  };
  
  const creatorName = getCreatorName();
  
  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!challengeData.expires_at) return null;
    const now = new Date();
    const expiresAt = new Date(challengeData.expires_at);
    const diffTime = expiresAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 0; // Already expired
    if (diffDays === 0) return 0; // Expires today
    return diffDays;
  };
  
  const daysUntilExpiration = getDaysUntilExpiration();
  
  return (
    <div className={challengeScreenStyles.challengeScreen}>
      {/* Floating Menu - available on challenge screen */}
      <FloatingMenu
        showFloatingMenu={showFloatingMenu}
        setShowFloatingMenu={setShowFloatingMenu}
        setModalType={setModalType}
        setShowModal={setShowModal}
        setGamesView={setGamesView}
        playMenuClickSound={playMenuClickSound}
      />
      <div className={challengeScreenStyles.challengeContent}>
        {/* Challenge Info Card - Compact */}
        <div className={challengeScreenStyles.challengeInfoCardCompact}>
          <div className={challengeScreenStyles.challengeInfoContentWrapper}>
            <div className={challengeScreenStyles.challengeInfoContent}>
              <div className={challengeScreenStyles.challengeInfoMetaCompact}>
                <span className={challengeScreenStyles.challengeCreatedTextCompact}>
                  Created by {creatorName || 'Unknown'} • {new Date(challengeData.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  {daysUntilExpiration !== null && (
                    <> • Expires in {daysUntilExpiration === 0 ? '<1 day' : daysUntilExpiration === 1 ? '1 day' : `${daysUntilExpiration} days`}</>
                  )}
                </span>
              </div>
              
              {/* Compact Settings Pills */}
              <div className={challengeScreenStyles.challengeSettingsPills}>
                {settings.gameMode && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Game Mode:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.gameMode}</span>
                  </span>
                )}
                {settings.gameType && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Type:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.gameType}</span>
                  </span>
                )}
                {settings.country && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Country:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.country}</span>
                  </span>
                )}
                {settings.region && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Region:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.region}</span>
                  </span>
                )}
                {settings.divisionTypes && settings.divisionTypes.length > 0 && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Divisions:</span>
                    <span className={challengeScreenStyles.settingPillValue}>
                      {(settings.divisionTypes.length === 1 || areAllDivisionsSelected(settings.country, settings.divisionTypes, regionalCountries, regionalDivisionTypes))
                        ? "All" 
                        : getDivisionTypeNames(settings.divisionTypes, regionalDivisionTypes) || "Selected"}
                    </span>
                  </span>
                )}
                {settings.territories && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Territories:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.territories}</span>
                  </span>
                )}
                {settings.mode && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Mode:</span>
                    <span className={challengeScreenStyles.settingPillValue}>{settings.mode}</span>
                  </span>
                )}
                {settings.typingMode && (
                  <span className={challengeScreenStyles.settingPill}>
                    <span className={challengeScreenStyles.settingPillLabel}>Typing:</span>
                    <span className={challengeScreenStyles.settingPillValue}>On</span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Flag Preview Container - Full Height */}
            {previewFlag && (
              <div className={challengeScreenStyles.challengeFlagPreview}>
                {isLoadingPreviewFlag ? (
                  <div className={challengeScreenStyles.flagPreviewLoading}>Loading...</div>
                ) : (
                  <img 
                    src={previewFlag.image_url} 
                    alt={previewFlag.name}
                    className={challengeScreenStyles.flagPreviewImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Leaderboard */}
        <div className={challengeScreenStyles.challengeLeaderboard}>
          <div className={challengeScreenStyles.leaderboardColumns}>
            <div className={challengeScreenStyles.leaderboardHeader}>
              <div className={challengeScreenStyles.colRank}>Rank</div>
              <div className={challengeScreenStyles.colName}>Player</div>
              <div className={challengeScreenStyles.colScore}>Score</div>
              <div className={challengeScreenStyles.colAccuracy}>Accuracy</div>
              <div className={challengeScreenStyles.colTime}>Time</div>
            </div>
            {challengeResults.length === 0 ? (
              // Empty rows fade out
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={challengeScreenStyles.leaderboardRowEmpty} style={{ opacity: 1 - (i * 0.15) }}>
                  <div className={challengeScreenStyles.colRank}>-</div>
                  <div className={challengeScreenStyles.colName}>-</div>
                  <div className={challengeScreenStyles.colScore}>-</div>
                  <div className={challengeScreenStyles.colAccuracy}>-</div>
                  <div className={challengeScreenStyles.colTime}>-</div>
                </div>
              ))
            ) : (
              <>
                {challengeResults.map((result, index) => (
                  <div 
                    key={result.id} 
                    className={`${challengeScreenStyles.leaderboardRow} ${result.isCurrentSession ? challengeScreenStyles.leaderboardRowCurrent : ''}`}
                  >
                    <div className={challengeScreenStyles.colRank}>{index + 1}</div>
                    <div className={challengeScreenStyles.colName}>{result.player_name}</div>
                    <div className={challengeScreenStyles.colScore}>{result.score}</div>
                    <div className={challengeScreenStyles.colAccuracy}>{result.accuracy}%</div>
                    <div className={challengeScreenStyles.colTime}>{formatTime(result.time_elapsed)}</div>
                  </div>
                ))}
                {/* Fade-out empty rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={`fade-${i}`} className={challengeScreenStyles.leaderboardRowEmpty} style={{ opacity: 1 - (i * 0.15) }}>
                    <div className={challengeScreenStyles.colRank}>-</div>
                    <div className={challengeScreenStyles.colName}>-</div>
                    <div className={challengeScreenStyles.colScore}>-</div>
                    <div className={challengeScreenStyles.colAccuracy}>-</div>
                    <div className={challengeScreenStyles.colTime}>-</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className={challengeScreenStyles.challengeActions}>
          {!hasPlayedChallenge ? (
            <button
              className={`${sharedStyles.button} ${challengeScreenStyles.mainButton}`}
              onClick={() => {
                playMenuClickSound();
                // Show name input modal before starting
                const name = prompt('Enter your name for the leaderboard:');
                if (name && name.trim()) {
                  setChallengePlayerName(name.trim());
                  // Start the game after getting the name
                  setTimeout(async () => {
                    setShowChallengeScreen(false);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await startGame();
                  }, 100);
                } else if (name !== null) {
                  // User clicked cancel or entered empty name
                  setMessage('Please enter a name to start the challenge');
                  setTimeout(() => setMessage(''), 3000);
                }
              }}
            >
              Start Game
            </button>
          ) : (
            <div className={challengeScreenStyles.challengeCompletedMessage}>
              <span className={challengeScreenStyles.challengeCompletedIcon}>✓</span>
              <span>You've already completed this challenge</span>
            </div>
          )}
          {challengeResults.length > 0 && (
            <button
              className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
              onClick={() => {
                playMenuClickSound();
                window.open(`/api/challenges/export?code=${challengeData.challenge_code}`, '_blank');
              }}
            >
              Export Results
            </button>
          )}
          <button
            className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
            onClick={() => {
              playMenuClickSound();
              setShowChallengeScreen(false);
              setIsChallengeMode(false);
              setChallengeData(null);
              setChallengeResults([]);
              setChallengePlayerName('');
              setChallengeScoreSubmitted(false);
              setMenuStep(0);
              setGameMode("standard");
              setGameType(null);
              setRegionalGameType(null);
              setSelectedRegionalCountry(null);
              setSelectedDivisionTypes([]);
              // Clear challenge from URL
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', window.location.pathname);
              }
            }}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;
