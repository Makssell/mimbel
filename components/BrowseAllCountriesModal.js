/**
 * BrowseAllCountriesModal Component
 * Modal for browsing and selecting regional countries
 */

import sharedStyles from "../styles/shared.module.css";
import modalsStyles from "../styles/modals.module.css";

const BrowseAllCountriesModal = ({
  showAllCountriesModal,
  setShowAllCountriesModal,
  isLoadingRegionalCountries,
  regionalCountries,
  regionalDivisionTypes,
  setSelectedRegionalCountry,
  setSelectedDivisionTypes,
  setMenuStep,
  playMenuClickSound
}) => {
  return (
    <div className={modalsStyles.modalOverlay} onClick={() => setShowAllCountriesModal(false)}>
      <div className={modalsStyles.browseAllModal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.browseAllModalHeader}>
          <h2>All Regional Countries</h2>
          <button 
            className={modalsStyles.modalCloseButton}
            onClick={() => setShowAllCountriesModal(false)}
          >
            ×
          </button>
        </div>
        <div className={modalsStyles.browseAllModalBody}>
          <div className={modalsStyles.regionalCountryList}>
            {isLoadingRegionalCountries ? (
              <div className={modalsStyles.emptyState}>
                <div className={modalsStyles.emptyStateIcon}>⏳</div>
                <div className={modalsStyles.emptyStateTitle}>Loading countries...</div>
                <div className={modalsStyles.emptyStateDescription}>Please wait while we fetch available countries</div>
              </div>
            ) : regionalCountries.length === 0 ? (
              <div className={modalsStyles.emptyState}>
                <div className={modalsStyles.emptyStateIcon}>🌍</div>
                <div className={modalsStyles.emptyStateTitle}>No countries found</div>
                <div className={modalsStyles.emptyStateDescription}>Please check your data or try refreshing the page</div>
              </div>
            ) : regionalCountries.filter(country => country.is_active).length === 0 ? (
              <div className={modalsStyles.emptyState}>
                <div className={modalsStyles.emptyStateIcon}>🚫</div>
                <div className={modalsStyles.emptyStateTitle}>No active countries</div>
                <div className={modalsStyles.emptyStateDescription}>All countries are currently inactive. Please contact an administrator.</div>
              </div>
            ) : (
              regionalCountries
                .filter(country => country.is_active)
                .map(country => (
                <div
                  key={country.id}
                  className={modalsStyles.regionalCountryItem}
                  onClick={() => {
                    playMenuClickSound();
                    setSelectedRegionalCountry(country);
                    setShowAllCountriesModal(false);
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
                    className={modalsStyles.regionalCountryFlag}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className={modalsStyles.regionalCountryFlagFallback} style={{ display: 'none' }}>
                    🌍
                  </div>
                  <div className={modalsStyles.regionalCountryInfo}>
                    <div className={modalsStyles.regionalCountryName}>{country.name}</div>
                    <div className={modalsStyles.regionalCountryCount}>{country.total_regional_flags} regional flags</div>
                  </div>
                  <span className={modalsStyles.regionalCountryArrow}>→</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseAllCountriesModal;
