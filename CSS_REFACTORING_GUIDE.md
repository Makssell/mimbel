# CSS Refactoring Guide

## Current Situation

- `game.module.css` is **6,776 lines** long
- Contains styles for multiple components mixed together
- Hard to maintain and navigate

## Solution

Split into smaller, component-scoped CSS module files.

## Step-by-Step Process

### Step 1: Create Shared Module (DONE)

Create `styles/shared.module.css` with common styles used across components:

- Container styles
- Button styles (button, mainButton, secondaryButton)
- Loading spinner
- Message/notification styles
- Common animations
- Transition classes

### Step 2: Create Component-Specific Modules

For each component, create a new CSS module file and extract relevant styles:

#### `startScreen.module.css`

Extract all styles related to:

- `.startScreen`, `.menuContainer`, `.contentArea`
- `.modeSelectionSection`, `.gameTypeSection`, `.continentSection`
- `.settingsSection`, `.regionalCountrySection`, `.divisionTypeSection`
- All related media queries

#### `gameScreen.module.css`

Extract all styles related to:

- `.gameInfo`, `.score`, `.timer`, `.health`
- `.flagContainer`, `.flagImage`, `.optionsContainer`
- `.guessButton`, `.flagGuessButton`, `.typingInput`
- All related media queries

#### `endScreen.module.css`

Extract all styles related to:

- `.endScreen`, `.endScreenContent`, `.endScreenHeader`
- `.quickStatsSection`, `.gameStats`, `.statsGrid`
- `.endScreenActions`
- All related media queries

#### `challengeScreen.module.css`

Extract all styles related to:

- `.challengeScreen`, `.challengeContent`
- `.challengeInfoCard`, `.challengeLeaderboard`
- `.leaderboardRow`, `.leaderboardHeader`
- All related media queries

#### `modals.module.css`

Extract all styles related to:

- `.modalOverlay`, `.modal`, `.modalHeader`
- `.floatingMenuContainer`, `.gamesModalContent`
- `.challengesModalContent`, `.browseAllModal`
- `.feedbackModal`, `.feedbackForm`
- All related media queries

### Step 3: Update Component Imports

Update each component file to import from the new modules:

```javascript
// Before
import styles from "../styles/game.module.css";

// After (example for StartScreen)
import sharedStyles from "../styles/shared.module.css";
import startScreenStyles from "../styles/startScreen.module.css";

// Then use: sharedStyles.container, startScreenStyles.startScreen, etc.
```

### Step 4: Test Thoroughly

- Test each component individually
- Check responsive breakpoints
- Verify animations work
- Check for any missing styles

### Step 5: Clean Up

- Once verified, rename `game.module.css` to `game.module.css.backup`
- Keep as reference until confident everything works

## Tips

1. **Use Find & Replace**: Search for class names in the original file to find all occurrences
2. **Include Media Queries**: Don't forget to extract related `@media` queries with each component
3. **Check Dependencies**: Some styles depend on others - make sure to include them
4. **Test Incrementally**: Extract one component at a time and test before moving to the next

## Tools

- Use the `extract_css_modules.py` script as a starting point (may need refinement)
- Use your IDE's search functionality to find all occurrences of class names
- Use CSS validators to check extracted files



