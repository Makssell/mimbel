# End Screen Documentation - Site1.js Flag Game

This document provides a comprehensive analysis of all end screen types in the Site1.js flag guessing game, including their content, statistics, and trigger conditions.

## Overview

The game has 4 distinct end screen types, each triggered by different game completion scenarios. All end screens share a common structure but display different content based on the `endState` variable.

## Common End Screen Structure

All end screens contain the following sections (from top to bottom):

1. **Header Section** - Icon, title, and subtitle
2. **Quick Stats Section** - Two prominent statistics cards (mode-specific)
3. **Game Settings Section** - Detailed game configuration (collapsible by default)
4. **Statistics Section** - Comprehensive game statistics grid (mode-specific)
5. **Action Buttons** - "New Game" and "Play Again" options

---

## End Screen Type 1: "ranOutOfHearts" (Game Over)

### Trigger Condition

- Player loses all 3 hearts in standard mode (not infinite mode)
- Occurs when player makes 3 incorrect guesses

### Header Content

- **Icon**: 💀 (skull with shake animation)
- **Title**: "Game Over!"
- **Subtitle**: "You ran out of hearts!"

### Quick Stats Section

1. **Left Card**: Points (final score)
2. **Right Card**: Accuracy percentage

### Game Settings Section

Collapsible section displaying all current game settings:

- Game Mode (Country Flags / Regional Flags)
- Game Type (Flag → Country, Country → Flag, Flag → Region, Region → Flag)
- Country (if regional mode)
- Region (if standard mode: World, Africa, Asia, Europe, North America, South America, Oceania)
- Territories (Included/Excluded - standard mode only)
- Mode (Standard/Infinite/Time Attack)

### Statistics Grid

1. **Total Score** 🎯 - Final score achieved
2. **Accuracy** 📊 - Percentage of correct answers
3. **Total Attempts** 🎲 - Number of guesses made
4. **Time Elapsed** ⏱️ - Total time played
5. **Remaining** 🚩 - Number of flags not attempted (only shown in standard mode, not infinite)

---

## End Screen Type 2: "allCompleted" (Victory)

### Trigger Condition

- Player successfully completes all available flags
- No more flags remain to be guessed
- Victory sound plays

### Header Content

- **Icon**: 🏆 (trophy with celebrate animation)
- **Title**: "All Done!"
- **Subtitle**: "You've completed all flags!"

### Quick Stats Section

1. **Left Card**: Points (final score)
2. **Right Card**: Completion Time (in seconds)

### Game Settings Section

Collapsible section - same as other end screens.

### Statistics Grid

1. **Total Score** 🎯 - Final score achieved
2. **Accuracy** 📊 - Percentage of correct answers
3. **Total Attempts** 🎲 - Number of guesses made
4. **Completion Time** 🏁 - Time taken to complete all flags
5. **Avg Time per Guess** ⏱️ - Average time spent per question

---

## End Screen Type 3: "infiniteMode" (Manual End)

### Trigger Condition

- Player manually ends an infinite mode game using the "End" button
- Only available when infinite mode is active and not in time attack mode

### Header Content

- **Icon**: ♾️ (infinity symbol with spin animation)
- **Title**: "Run Complete!"
- **Subtitle**: "Great job on your infinite run!"

### Quick Stats Section

1. **Left Card**: Points (final score)
2. **Right Card**: Longest Correct Streak ⚡

### Game Settings Section

Collapsible section - same as other end screens.

### Statistics Grid

1. **Total Score** 🎯 - Final score achieved
2. **Accuracy** 📊 - Percentage of correct answers
3. **Total Attempts** 🎲 - Number of guesses made
4. **Time Elapsed** ⏱️ - Total time played
5. **Longest Streak** ⚡ - Longest consecutive correct answers

---

## End Screen Type 4: "timeAttack" (Time's Up)

### Trigger Condition

- 60-second timer reaches zero in Time Attack mode
- Timer starts on first guess and counts down
- Incorrect answers deduct 5 seconds from remaining time

### Header Content

- **Icon**: ⏱️ (timer with pulse animation)
- **Title**: "Time's Up!"
- **Subtitle**: "Great job on your time attack run!"

### Quick Stats Section

1. **Left Card**: Points (final score)
2. **Right Card**: Average Time per Guess ⏱️

### Game Settings Section

Collapsible section - same as other end screens.

### Statistics Grid

1. **Total Score** 🎯 - Final score achieved
2. **Accuracy** 📊 - Percentage of correct answers
3. **Total Attempts** 🎲 - Number of guesses made
4. **Avg Time per Guess** ⏱️ - Average time spent per question
5. **Fastest Guess** 🏃 - Quickest correct answer time

---

## Game Mode Variations

### Standard Mode (Country Flags)

- **Available End States**: ranOutOfHearts, allCompleted, timeAttack
- **Additional Stats**: Remaining flags count (when applicable)
- **Settings**: Includes continent and territory options

### Regional Mode (Regional Flags)

- **Available End States**: ranOutOfHearts, allCompleted, infiniteMode, timeAttack
- **Settings**: Includes country and division type selections
- **No Remaining Flags Stat**: Not shown in regional mode

---

## Animation Details

### Header Animations

- **ranOutOfHearts**: Shake animation for skull icon
- **allCompleted**: Celebrate animation (rotate and scale) for trophy
- **infiniteMode**: Spin animation for infinity symbol
- **timeAttack**: Pulse animation for timer icon

### Content Animations

- Header slides in from top
- Sections slide in from bottom with staggered timing
- Stat cards have hover effects with scaling and glow
- Action buttons have hover animations
- Game Settings section has expand/collapse animation with smooth transitions

---

## Sound Effects

Each end screen type triggers specific audio:

- **ranOutOfHearts**: Game over sound (3-note descending motif)
- **allCompleted**: Victory sound (arpeggiated upward chord)
- **infiniteMode**: Game over sound
- **timeAttack**: Game over sound

---

## Technical Implementation

### State Variables

- `endState`: Determines which end screen type to display
- `gameStats`: Contains all statistics and settings data
- `showEndScreen`: Controls end screen visibility
- `showGameSettings`: Controls game settings section visibility (collapsible)

### New Tracking Variables

- `longestStreak`: Tracks longest consecutive correct answers
- `currentStreak`: Tracks current consecutive correct answers
- `guessTimes`: Array of times for each correct guess (for average calculations)
- `fastestGuess`: Tracks the quickest correct answer time (in seconds)
- `lastGuessTime`: Timestamp when question was loaded

### Key Functions

- `endInfiniteMode()`: Handles infinite mode completion
- `endTimeAttackGame()`: Handles time attack completion
- `checkAnswer()`: Triggers ranOutOfHearts when health reaches 0, updates streaks
- `loadNextQuestion()`: Triggers allCompleted when no flags remain
- `calculateAverageTime()`: Calculates average time per correct guess (in seconds)
- `updateStreak()`: Updates current and longest streaks
- `recordGuessTime()`: Records time for correct answers only

### Data Structure

```javascript
gameStats: {
  score: number,
  totalAttempts: number,
  accuracy: string,
  timeElapsed: number,
  endState: string,
  gameType: string,
  gameSettings: object,
  totalFlags: number,
  remainingFlags: number,
  longestStreak: number,
  averageTimePerGuess: number,
  fastestGuess: number,
  completionTime: number
}
```

---

## Responsive Design

The end screen adapts to different screen sizes:

- **Desktop**: Full layout with all sections visible
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Single-column layout, stacked action buttons

All animations and interactions are preserved across device types.

---

## User Experience Improvements

### Quick Stats Optimization

- **Mode-specific metrics**: Each end screen shows the most relevant secondary statistic
- **Visual hierarchy**: Points always on left, contextual metric on right
- **Icon consistency**: Each metric has a distinctive icon
- **ranOutOfHearts**: Accuracy percentage
- **allCompleted**: Completion time
- **infiniteMode**: Longest streak with lightning icon
- **timeAttack**: Average time per guess with timer icon

### Statistics Grid Enhancement

- **Relevant metrics**: Each mode shows the most meaningful statistics
- **Performance focus**: Time-based modes emphasize speed metrics
- **Achievement tracking**: Streak-based modes highlight consistency
- **ranOutOfHearts**: Total Score, Accuracy, Total Attempts, Time Elapsed, Remaining
- **allCompleted**: Total Score, Accuracy, Total Attempts, Completion Time, Avg Time per Guess
- **infiniteMode**: Total Score, Accuracy, Total Attempts, Time Elapsed, Longest Streak
- **timeAttack**: Total Score, Accuracy, Total Attempts, Avg Time per Guess, Fastest Guess

### Game Settings Accessibility

- **Collapsible by default**: Users see results first, can expand for details
- **Smooth animations**: Expand/collapse with easing transitions
- **Clear labeling**: Easy to understand what each setting means
- **Interactive header**: Clickable with hover effects and visual feedback
- **Space efficient**: Saves screen real estate while keeping information accessible

---

## Performance Considerations

### Time Tracking

- Only records time for correct answers to maintain accuracy
- Uses millisecond precision for fastest guess calculations
- Averages are calculated in real-time as game progresses
- All time values are stored and displayed in seconds for consistency

### Streak Tracking

- Updates on every answer (correct or incorrect)
- Maintains both current and longest streak simultaneously
- Resets current streak on incorrect answers

### Memory Management

- Guess times array grows with correct answers
- Fastest guess is updated only when beaten
- All tracking variables are reset on new game start

---

## Bug Fixes

### Accuracy Calculation Fix

- **Issue**: Accuracy could show over 100% when game ended with correct answer
- **Cause**: Final correct attempt wasn't included in total attempts count
- **Fix**: Added +1 to total attempts for "allCompleted" and "ranOutOfHearts" end states
- **Result**: Accurate percentage calculation (e.g., 15 correct out of 15 attempts = 100%)

### Time Display Fix

- **Issue**: Average time per guess showed unrealistic values (e.g., 2146s)
- **Cause**: Time was stored in milliseconds but displayed as seconds
- **Fix**: Convert milliseconds to seconds in `calculateAverageTime()` function
- **Result**: Realistic time values (e.g., 2.1s average per guess)

### Fastest Guess Consistency

- **Issue**: Fastest guess was stored in milliseconds but displayed in seconds
- **Fix**: Store fastest guess in seconds for consistency
- **Result**: Consistent time unit display across all statistics
