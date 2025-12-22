# CSS Refactoring Plan

## Overview

The `game.module.css` file is 6,776 lines long and needs to be split into smaller, maintainable CSS module files.

## File Structure

### 1. `shared.module.css`

**Purpose**: Common styles used across multiple components
**Contains**:

- `.container` and `.container::before`
- `.button`, `.mainButton`, `.secondaryButton`
- `.loadingSpinner`
- `.message`, `.message.transitioning`
- `.transitioning` class
- `.correctButton`, `.incorrectButton`
- `.correctInput`, `.incorrectInput`
- `.title`
- Common animations: `@keyframes spin`, `@keyframes slideUp`, `@keyframes pulse`
- Common responsive styles for container

### 2. `startScreen.module.css`

**Purpose**: Styles for the StartScreen component
**Contains**:

- `.startScreen`
- `.menuContainer`
- `.contentArea`
- `.fixedProgressBar`
- `.modeSelectionSection`, `.modeSelectionGrid`, `.modeButton`
- `.gameTypeSection`, `.gameTypeGrid`, `.menuButton`
- `.continentSection`, `.continentGrid`, `.continentButton`
- `.settingsSection`, `.settingsGrid`, `.settingOption`
- `.regionalCountrySection`, `.regionalCountryList`, `.regionalCountryItem`
- `.divisionTypeSection`, `.divisionTypeList`, `.divisionTypeItem`
- `.emptyState`, `.emptyStateIcon`, `.emptyStateTitle`, `.emptyStateDescription`
- `.browseAllSection`, `.browseAllButton`
- All related media queries

### 3. `gameScreen.module.css`

**Purpose**: Styles for the GameScreen component
**Contains**:

- `.gameInfo`, `.gameInfo::before`
- `.score`, `.scoreLabel`, `.scoreValue`, `.scoreValue.increase`
- `.timer`, `.timerLabel`, `.timerValue`, `.timerWarning`, `.timerCritical`
- `.health`, `.heart`, `.activeHeart`, `.inactiveHeart`
- `.endGameButton`
- `.flagContainer`, `.flagImage`
- `.optionsContainer`
- `.guessButton`, `.flagGuessButton`
- `.typingInputContainer`, `.typingInput`, `.submitButton`
- `.flagLoadingPlaceholder`, `.flagErrorPlaceholder`
- `.countryText`
- All related animations and media queries

### 4. `endScreen.module.css`

**Purpose**: Styles for the EndScreen component
**Contains**:

- `.endScreen`, `.endScreenContent`
- `.endScreenHeader`
- `.endStateIcon`, `.endStateTitle`, `.endStateSubtitle`
- `.quickStatsSection`, `.quickStatCard`, `.quickStatValue`, `.quickStatLabel`
- `.gameSettings`, `.settingsInfo`, `.settingItem`
- `.gameStats`, `.statsGrid`, `.statCard`, `.statIcon`, `.statContent`, `.statLabel`, `.statValue`
- `.endScreenActions`
- `.endScreenSettingLabel`, `.endScreenSettingValue`
- All related media queries

### 5. `challengeScreen.module.css`

**Purpose**: Styles for the ChallengeScreen component
**Contains**:

- `.challengeScreen`, `.challengeContent`
- `.challengeInfoCard`, `.challengeInfoCardCompact`
- `.challengeInfoContentWrapper`, `.challengeInfoContent`
- `.challengeInfoMetaCompact`, `.challengeCreatedTextCompact`
- `.challengeSettingsPills`, `.settingPill`, `.settingPillLabel`, `.settingPillValue`
- `.challengeFlagPreview`, `.flagPreviewImage`, `.flagPreviewLoading`
- `.challengeLeaderboard`, `.leaderboardColumns`, `.leaderboardHeader`
- `.leaderboardRow`, `.leaderboardRowEmpty`, `.leaderboardRowCurrent`
- `.colRank`, `.colName`, `.colScore`, `.colAccuracy`, `.colTime`
- `.challengeActions`, `.challengeCompletedMessage`
- All related media queries

### 6. `modals.module.css`

**Purpose**: Styles for modal components (HelpModal, GamesModal, ChallengesModal, BrowseAllCountriesModal, FeedbackModal)
**Contains**:

- `.modalOverlay`, `.modal`, `.modalHeader`, `.closeButton`
- `.modalForm`, `.modalContent`
- `.helpSection`, `.helpItem`
- `.floatingMenuContainer`, `.floatingMenuButton`, `.floatingMenuDropdown`, `.floatingMenuItem`
- `.gamesModalContent`, `.gamesViewTabs`, `.gamesViewTab`
- `.challengesModalContent`, `.challengeItem`, `.challengeInfo`, `.challengeCode`
- `.browseAllModal`, `.browseAllModalHeader`, `.browseAllModalBody`
- `.feedbackModal`, `.feedbackForm`, `.formGroup`, `.formLabel`, `.formInput`, `.formTextarea`
- `.categoryGrid`, `.categoryButton`, `.submitMessage`
- All related media queries

### 7. `progressBar.module.css`

**Purpose**: Styles for the ProgressBar component
**Contains**:

- `.progressBar`, `.progressStep`, `.progressStepActive`, etc.
- All related media queries

## Migration Steps

1. ✅ Create new CSS module files
2. ✅ Extract styles from `game.module.css` to appropriate files
3. ✅ Update component imports:
   - `pages/index.js` - import from multiple modules
   - `components/StartScreen.js` - import `startScreen.module.css` and `shared.module.css`
   - `components/GameScreen.js` - import `gameScreen.module.css` and `shared.module.css`
   - `components/EndScreen.js` - import `endScreen.module.css` and `shared.module.css`
   - `components/ChallengeScreen.js` - import `challengeScreen.module.css` and `shared.module.css`
   - `components/FloatingMenu.js` - import `modals.module.css` and `shared.module.css`
   - `components/HelpModal.js` - import `modals.module.css` and `shared.module.css`
   - `components/GamesModal.js` - import `modals.module.css` and `shared.module.css`
   - `components/ChallengesModal.js` - import `modals.module.css` and `shared.module.css`
   - `components/BrowseAllCountriesModal.js` - import `modals.module.css` and `shared.module.css`
   - `components/ProgressBar.js` - import `progressBar.module.css` and `shared.module.css`
4. ✅ Test all components to ensure styles work correctly
5. ✅ Remove or archive original `game.module.css` (keep as backup initially)

## Notes

- Some styles may be shared between components - these should go in `shared.module.css`
- Media queries should be included in each module file for the styles they affect
- Keep the original file as `game.module.css.backup` until refactoring is verified
- Test thoroughly after each major extraction to catch any missing styles



