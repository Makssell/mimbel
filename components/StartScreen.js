/**
 * StartScreen Component
 * Displays the game setup menu with all configuration steps
 */

import sharedStyles from "../styles/shared.module.css";
import startScreenStyles from "../styles/startScreen.module.css";
import ProgressBar from "./ProgressBar";
import FloatingMenu from "./FloatingMenu";
// Note: MenuButton, ActionButton, and ContinentButton need to be created or replaced
// These were likely from a mobile version - creating placeholder components
import MenuButton from "./MenuButton";
import ActionButton from "./ActionButton";
import ContinentButton from "./ContinentButton";
import DiceButton from "./DiceButton";

export default function StartScreen({
  // State
  gameMode,
  menuStep,
  progressBarHover,
  gameType,
  selectedContinent,
  includeTerritories,
  timeAttackMode,
  infiniteMode,
  typingMode,
  regionalGameType,
  regionalInfiniteMode,
  regionalTypingMode,
  selectedRegionalCountry,
  selectedDivisionTypes,
  isLoadingFeaturedCountries,
  featuredCountries,
  isLoadingRegionalCountries,
  regionalDivisionTypes,
  showFloatingMenu,
  // Setters
  setProgressBarHover,
  setGameMode,
  setMenuStep,
  setGameType,
  setSelectedContinent,
  setIncludeTerritories,
  setTimeAttackMode,
  setInfiniteMode,
  setTypingMode,
  setRegionalGameType,
  setRegionalInfiniteMode,
  setRegionalTypingMode,
  setSelectedRegionalCountry,
  setSelectedDivisionTypes,
  setShowAllCountriesModal,
  setShowFloatingMenu,
  setModalType,
  setShowModal,
  setGamesView,
  // Functions
  getProgressSteps,
  getCurrentStepIndex,
  getCompletedSteps,
  canGoBack,
  canGoForward,
  goToPreviousStep,
  goToNextStep,
  handleProgressStepClick,
  playMenuClickSound,
  startGame,
  handleRandomize
}) {
  return (
    <div className={startScreenStyles.startScreen}>
      {/* Fixed Progress Bar */}
      <div className={startScreenStyles.fixedProgressBar}>
        <ProgressBar
          gameMode={gameMode}
          menuStep={menuStep}
          progressBarHover={progressBarHover}
          setProgressBarHover={setProgressBarHover}
          getProgressSteps={getProgressSteps}
          getCurrentStepIndex={getCurrentStepIndex}
          getCompletedSteps={getCompletedSteps}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          handleProgressStepClick={handleProgressStepClick}
          playMenuClickSound={playMenuClickSound}
        />
      </div>
      
      {/* Consistent Content Area */}
      <div className={startScreenStyles.contentArea}>
        <div className={startScreenStyles.menuContainer}>
          {menuStep === 0 && (
            <div className={startScreenStyles.modeSelectionSection}>
              <div className={startScreenStyles.modeSelectionGrid}>
                <MenuButton
                  type="mode"
                  icon="🌐"
                  label="Country Flags"
                  description="Play with national flags and territories"
                  isSelected={gameMode === "standard"}
                  onClick={() => {
                    playMenuClickSound();
                    setGameMode("standard");
                    setMenuStep(1);
                  }}
                />
                <MenuButton
                  type="mode"
                  icon="🏳️"
                  label="Regional Flags"
                  description="Play with state, province, and regional flags"
                  isSelected={gameMode === "regional"}
                  onClick={() => {
                    playMenuClickSound();
                    setGameMode("regional");
                    setMenuStep("regional-1");
                  }}
                />
              </div>
              <DiceButton
                onClick={handleRandomize}
                disabled={isLoadingFeaturedCountries || isLoadingRegionalCountries}
              />
            </div>
          )}
          {menuStep === 1 && (
            <div className={startScreenStyles.gameTypeSection}>
              <div className={startScreenStyles.gameTypeGrid}>
                <MenuButton
                  type="gameType"
                  icon="🎯"
                  label="Flag to Country"
                  description="Guess the country name from the flag"
                  isSelected={gameType === "flag-to-country"}
                  onClick={() => {
                    playMenuClickSound();
                    setGameType("flag-to-country");
                    setMenuStep(2);
                  }}
                />
                <MenuButton
                  type="gameType"
                  icon="🗺️"
                  label="Country to Flag"
                  description="Guess the flag from the country name"
                  isSelected={gameType === "country-to-flag"}
                  onClick={() => {
                    playMenuClickSound();
                    setGameType("country-to-flag");
                    setMenuStep(2);
                  }}
                />
              </div>
            </div>
          )}
          {menuStep === 2 && (
            <div className={startScreenStyles.continentSection}>
              <div className={startScreenStyles.continentGrid}>
                <ContinentButton
                  label="World"
                  isSelected={selectedContinent === "world"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("world");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="Africa"
                  isSelected={selectedContinent === "1"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("1");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="Asia"
                  isSelected={selectedContinent === "2"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("2");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="Europe"
                  isSelected={selectedContinent === "3"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("3");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="North America"
                  isSelected={selectedContinent === "4"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("4");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="South America"
                  isSelected={selectedContinent === "5"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("5");
                    setMenuStep(3);
                  }}
                />
                <ContinentButton
                  label="Oceania"
                  isSelected={selectedContinent === "6"}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedContinent("6");
                    setMenuStep(3);
                  }}
                />
              </div>
            </div>
          )}
          {menuStep === 3 && (
            <div className={startScreenStyles.settingsSection}>
              <div className={startScreenStyles.settingsGrid}>
                <MenuButton
                  type="setting"
                  icon="🏝️"
                  label="Include Territories"
                  description="Play with territories and dependencies"
                  isSelected={includeTerritories}
                  onClick={() => {
                    playMenuClickSound();
                    setIncludeTerritories(!includeTerritories);
                  }}
                />
                <MenuButton
                  type="setting"
                  icon="⏱️"
                  label="Time Attack Mode"
                  description="Get the highest score in 1 minute (no save)"
                  isSelected={timeAttackMode}
                  onClick={() => {
                    playMenuClickSound();
                    setTimeAttackMode(!timeAttackMode);
                    if (!timeAttackMode) {
                      setInfiniteMode(true); // Auto-enable infinite mode
                    } else {
                      setInfiniteMode(false); // Reset to standard mode when disabling time attack
                    }
                  }}
                />
                <MenuButton
                  type="setting"
                  icon="♾️"
                  label="Infinite Mode"
                  description="Play endlessly without running out of flags"
                  isSelected={infiniteMode}
                  onClick={() => {
                    playMenuClickSound();
                    setInfiniteMode(!infiniteMode);
                  }}
                  disabled={timeAttackMode} // Disable when time attack is enabled
                />
                {gameType === "flag-to-country" && (
                  <MenuButton
                    type="setting"
                    icon="⌨️"
                    label="Typing Mode"
                    description="Type the answer instead of multiple choice"
                    isSelected={typingMode}
                    onClick={() => {
                      playMenuClickSound();
                      setTypingMode(!typingMode);
                    }}
                  />
                )}
              </div>
              <div className={startScreenStyles.settingsButtons}>
                <ActionButton onClick={() => {
                  playMenuClickSound();
                  startGame();
                }}>
                  Start Game
                </ActionButton>
              </div>
            </div>
          )}
          
          {/* Regional Mode Menu Steps */}
          {menuStep === "regional-1" && (
            <div className={startScreenStyles.gameTypeSection}>
              <div className={startScreenStyles.gameTypeGrid}>
                <MenuButton
                  type="gameType"
                  icon="🎯"
                  label="Flag to Region"
                  description="Guess the region name from the flag"
                  isSelected={regionalGameType === "flag-to-region"}
                  onClick={() => {
                    playMenuClickSound();
                    setRegionalGameType("flag-to-region");
                    setMenuStep("regional-2");
                  }}
                />
                <MenuButton
                  type="gameType"
                  icon="🗺️"
                  label="Region to Flag"
                  description="Guess the flag from the region name"
                  isSelected={regionalGameType === "region-to-flag"}
                  onClick={() => {
                    playMenuClickSound();
                    setRegionalGameType("region-to-flag");
                    setMenuStep("regional-2");
                  }}
                />
              </div>
            </div>
          )}
          
          {menuStep === "regional-2" && (
            <div className={startScreenStyles.regionalCountrySection}>
              <div className={startScreenStyles.regionalCountryList}>
                {isLoadingFeaturedCountries ? (
                  <div className={startScreenStyles.emptyState}>
                    <div className={startScreenStyles.emptyStateIcon}>⏳</div>
                    <div className={startScreenStyles.emptyStateTitle}>Loading featured countries...</div>
                    <div className={startScreenStyles.emptyStateDescription}>Please wait while we fetch featured countries</div>
                  </div>
                ) : featuredCountries.length === 0 ? (
                  <div className={startScreenStyles.emptyState}>
                    <div className={startScreenStyles.emptyStateIcon}>⭐</div>
                    <div className={startScreenStyles.emptyStateTitle}>No featured countries</div>
                    <div className={startScreenStyles.emptyStateDescription}>No countries are currently marked as featured. Please contact an administrator.</div>
                  </div>
                ) : (
                  featuredCountries
                    .filter(country => country.is_active)
                    .map(country => (
                    <div
                      key={country.id}
                      className={startScreenStyles.regionalCountryItem}
                      onClick={() => {
                        playMenuClickSound();
                        setSelectedRegionalCountry(country);
                        // Check if this country has only one division type group
                        const countryDivisionTypes = regionalDivisionTypes.filter(
                          divisionType => divisionType.country_id === country.id
                        );
                        
                        if (countryDivisionTypes.length === 1) {
                          // Skip toggles step, go straight to game settings
                          setSelectedDivisionTypes([countryDivisionTypes[0].id]);
                          setMenuStep("regional-4");
                        } else {
                          // Go to division type selection
                          setMenuStep("regional-3");
                        }
                      }}
                    >
                      <img
                        src={country.flag_image_url}
                        alt={country.name}
                        className={startScreenStyles.regionalCountryFlag}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className={startScreenStyles.regionalCountryFlagFallback} style={{ display: 'none' }}>
                        🌍
                      </div>
                      <div className={startScreenStyles.regionalCountryInfo}>
                        <div className={startScreenStyles.regionalCountryName}>{country.name}</div>
                        <div className={startScreenStyles.regionalCountryCount}>{country.total_regional_flags} regional flags</div>
                      </div>
                      <span className={startScreenStyles.regionalCountryArrow}>→</span>
                    </div>
                  ))
                )}
              </div>
              
              {/* Browse All Button */}
              {!isLoadingFeaturedCountries && featuredCountries.length > 0 && (
                <div className={startScreenStyles.browseAllSection}>
                  <ActionButton
                    variant="primary"
                    onClick={() => {
                      playMenuClickSound();
                      setShowAllCountriesModal(true);
                    }}
                    className={startScreenStyles.browseAllButton}
                  >
                    🌍 Browse All
                  </ActionButton>
                </div>
              )}
            </div>
          )}
          
          {menuStep === "regional-3" && (
            <div className={startScreenStyles.divisionTypeSection}>
              {/* Only shown if country has >1 division type */}
              <div className={startScreenStyles.divisionTypeList}>
                {isLoadingRegionalCountries ? (
                  <div className={startScreenStyles.emptyState}>
                    <div className={startScreenStyles.emptyStateIcon}>⏳</div>
                    <div className={startScreenStyles.emptyStateTitle}>Loading division types...</div>
                    <div className={startScreenStyles.emptyStateDescription}>Please wait while we fetch available divisions</div>
                  </div>
                ) : !selectedRegionalCountry ? (
                  <div className={startScreenStyles.emptyState}>
                    <div className={startScreenStyles.emptyStateIcon}>⚠️</div>
                    <div className={startScreenStyles.emptyStateTitle}>No country selected</div>
                    <div className={startScreenStyles.emptyStateDescription}>Please go back and select a country first</div>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setMenuStep("regional-2")}
                      className={startScreenStyles.backButton}
                    >
                      ← Back to Countries
                    </ActionButton>
                  </div>
                ) : regionalDivisionTypes.filter(divisionType => 
                    divisionType.country_id === selectedRegionalCountry?.id && 
                    divisionType.is_active
                  ).length === 0 ? (
                  <div className={startScreenStyles.emptyState}>
                    <div className={startScreenStyles.emptyStateIcon}>🏛️</div>
                    <div className={startScreenStyles.emptyStateTitle}>No divisions available</div>
                    <div className={startScreenStyles.emptyStateDescription}>
                      No active divisions found for {selectedRegionalCountry.name}. 
                      This country may not have regional flags configured.
                    </div>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setMenuStep("regional-2")}
                      className={startScreenStyles.backButton}
                    >
                      ← Back to Countries
                    </ActionButton>
                  </div>
                ) : (
                  regionalDivisionTypes
                    .filter(divisionType => divisionType.country_id === selectedRegionalCountry?.id && divisionType.is_active)
                    .map(divisionType => (
                    <div
                      key={divisionType.id}
                      className={`${startScreenStyles.divisionTypeItem} ${selectedDivisionTypes.includes(divisionType.id) ? startScreenStyles.selected : ''}`}
                      onClick={() => {
                        playMenuClickSound();
                        if (selectedDivisionTypes.includes(divisionType.id)) {
                          setSelectedDivisionTypes(selectedDivisionTypes.filter(id => id !== divisionType.id));
                        } else {
                          setSelectedDivisionTypes([...selectedDivisionTypes, divisionType.id]);
                        }
                      }}
                    >
                      <div className={startScreenStyles.divisionTypeCheckbox}></div>
                      <div className={startScreenStyles.divisionTypeInfo}>
                        <div className={startScreenStyles.divisionTypeName}>{divisionType.type_name}</div>
                        <div className={startScreenStyles.divisionTypeCount}>{divisionType.flag_count} regional flags</div>
                      </div>
                      <span className={startScreenStyles.divisionTypeIcon}>✓</span>
                    </div>
                  ))
                )}
              </div>
              {selectedDivisionTypes.length > 0 && (
                <div className={startScreenStyles.settingsButtons}>
                  <button
                    className={`${sharedStyles.button} ${sharedStyles.mainButton}`}
                    onClick={() => {
                      playMenuClickSound();
                      setMenuStep("regional-4");
                    }}
                    disabled={selectedDivisionTypes.length === 0}
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}
          
          {menuStep === "regional-4" && (
            <div className={startScreenStyles.settingsSection}>
              <div className={startScreenStyles.settingsGrid}>
                <MenuButton
                  type="setting"
                  icon="⏱️"
                  label="Time Attack Mode"
                  description="Get the highest score in 1 minute (no save)"
                  isSelected={timeAttackMode}
                  onClick={() => {
                    playMenuClickSound();
                    setTimeAttackMode(!timeAttackMode);
                    if (!timeAttackMode) {
                      setRegionalInfiniteMode(true); // Auto-enable infinite mode
                    } else {
                      setRegionalInfiniteMode(false); // Reset to standard mode when disabling time attack
                    }
                  }}
                />
                <MenuButton
                  type="setting"
                  icon="♾️"
                  label="Infinite Mode"
                  description="Play endlessly without running out of flags"
                  isSelected={regionalInfiniteMode}
                  onClick={() => {
                    playMenuClickSound();
                    setRegionalInfiniteMode(!regionalInfiniteMode);
                  }}
                  disabled={timeAttackMode} // Disable when time attack is enabled
                />
                {regionalGameType === "flag-to-region" && (
                  <MenuButton
                    type="setting"
                    icon="⌨️"
                    label="Typing Mode"
                    description="Type the answer instead of multiple choice"
                    isSelected={regionalTypingMode}
                    onClick={() => {
                      playMenuClickSound();
                      setRegionalTypingMode(!regionalTypingMode);
                    }}
                  />
                )}
              </div>
              <div className={startScreenStyles.settingsButtons}>
                <ActionButton onClick={() => {
                  playMenuClickSound();
                  startGame();
                }}>
                  Start Game
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Menu - only shown when not in game */}
      <FloatingMenu
        showFloatingMenu={showFloatingMenu}
        setShowFloatingMenu={setShowFloatingMenu}
        setModalType={setModalType}
        setShowModal={setShowModal}
        setGamesView={setGamesView}
        playMenuClickSound={playMenuClickSound}
      />
    </div>
  );
}
