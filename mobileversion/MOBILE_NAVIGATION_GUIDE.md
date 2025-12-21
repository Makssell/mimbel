# Mobile Navigation Structure Guide

## Current Web Structure vs Mobile Structure

### Current Web Structure

```
- Single page app (site1.js)
- Modal overlays for different views
- No traditional navigation
- State-based screen switching
```

### Recommended Mobile Structure

```
App Navigator (Stack)
├── Onboarding Stack (first launch only)
│   └── OnboardingScreen
│
├── Main Tab Navigator
│   ├── Home Tab
│   │   └── HomeScreen
│   │       ├── Game Mode Selection
│   │       ├── Quick Start Button
│   │       └── Recent Games
│   │
│   ├── Game Stack (nested)
│   │   ├── GameScreen (main game from site1.js)
│   │   ├── EndScreen (game completion)
│   │   └── ChallengeScreen (view/create challenges)
│   │
│   ├── History Tab
│   │   └── HistoryScreen
│   │       ├── Game History List
│   │       ├── Best Scores
│   │       └── Statistics
│   │
│   └── Settings Tab
│       └── SettingsScreen
│           ├── Sync Status
│           ├── Audio Toggle
│           ├── About
│           └── Feedback
```

## Navigation Implementation (React Navigation)

```javascript
// navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import GameScreen from "../screens/GameScreen";
import EndScreen from "../screens/EndScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ChallengeScreen from "../screens/ChallengeScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Game Stack (nested navigation)
function GameStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, next }) => {
          return {
            cardStyle: {
              opacity: current.progress,
            },
          };
        },
      }}
    >
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen
        name="End"
        component={EndScreen}
        options={{
          gestureEnabled: false, // Prevent going back
        }}
      />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Game") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "History") {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Game"
        component={GameStack}
        options={{
          tabBarStyle: { display: "none" }, // Hide tab when in game
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
```

## Screen Breakdown

### 1. HomeScreen

**Purpose**: Main entry point, game mode selection

**Components from site1.js**:

- Mode selection buttons (Standard/Regional)
- Continent selection (if Standard mode)
- Regional country selection (if Regional mode)
- Game type selection (flag-to-country, country-to-flag)
- Settings toggle (infinite mode, time attack, typing mode)
- Start game button

**Navigation**:

- Navigate to GameScreen with game settings

```javascript
// screens/HomeScreen.js (simplified)
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [gameMode, setGameMode] = useState(null);
  const [gameType, setGameType] = useState(null);

  const startGame = () => {
    navigation.navigate("Game", {
      gameMode,
      gameType,
      // ... other settings
    });
  };

  return (
    <View>
      {/* Mode selection UI */}
      <TouchableOpacity onPress={startGame}>
        <Text>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 2. GameScreen

**Purpose**: Main game play (core of site1.js)

**What to extract from site1.js**:

- All game state management
- Flag loading logic
- Answer checking
- Score tracking
- Timer (for Time Attack mode)
- Health system
- Question generation

**Navigation**:

- Navigate to EndScreen when game ends
- Can navigate back to Home (with confirmation if game in progress)

```javascript
// screens/GameScreen.js structure
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGame } from "../hooks/useGame";

export default function GameScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameMode, gameType } = route.params;

  const {
    currentFlag,
    options,
    score,
    health,
    handleAnswer,
    // ... other game state
  } = useGame({
    gameMode,
    gameType,
    onGameEnd: (gameStats) => {
      navigation.navigate("End", { gameStats });
    },
  });

  return <View>{/* Game UI from site1.js */}</View>;
}
```

### 3. EndScreen

**Purpose**: Show game results

**Components from site1.js**:

- End screen UI (score, stats, streaks)
- Play Again button
- Share Challenge button
- Main Menu button

**Navigation**:

- Navigate back to Home
- Navigate to Game (Play Again)
- Navigate to Challenge (Share)

### 4. HistoryScreen

**Purpose**: Show game history and best scores

**Data from site1.js**:

- `gameHistory` state
- `bestScores` state
- Statistics calculations

**Components**:

- FlatList of game history
- Best scores section
- Statistics charts (optional)

### 5. SettingsScreen

**Purpose**: App settings and info

**Features**:

- Sync status and manual sync
- Audio toggle
- About section
- Feedback button
- Clear data option

## Navigation Patterns

### 1. Modal Overlays → Stack Screens

**Current**: Modal overlays for different views
**Mobile**: Use Stack navigation with modal presentation

```javascript
// Instead of modal state
const [showModal, setShowModal] = useState(false);

// Use navigation
navigation.navigate("ModalScreen", { type: "feedback" });
```

### 2. State-Based Screen Switching → Navigation

**Current**:

```javascript
if (menuStep === 0) return <ModeSelection />;
if (menuStep === 1) return <GameTypeSelection />;
```

**Mobile**:

```javascript
// Use navigation stack
<Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
<Stack.Screen name="GameType" component={GameTypeScreen} />
```

### 3. Deep Linking

**For challenge sharing**:

```javascript
// navigation/linking.js
const linking = {
  prefixes: ["mimbel://", "https://mimbel.app"],
  config: {
    screens: {
      Home: "",
      Game: "game",
      Challenge: "challenge/:id",
    },
  },
};

// Usage
<NavigationContainer linking={linking}>{/* ... */}</NavigationContainer>;
```

## Component Adaptation Checklist

### ✅ Can Use As-Is (with minor changes)

- Game logic functions
- Answer checking logic
- Score calculation
- Statistics tracking

### 🔄 Needs Adaptation

- **CSS Modules → StyleSheet**: Convert all CSS to React Native StyleSheet
- **HTML elements → React Native components**:
  - `div` → `View`
  - `button` → `TouchableOpacity` or `Pressable`
  - `input` → `TextInput`
  - `img` → `Image` (or `expo-image`)
  - `p`, `span`, `h1` → `Text`

### 🔄 Needs Mobile-Specific Implementation

- **Navigation**: Replace state-based switching with React Navigation
- **Storage**: Replace localStorage with SQLite/AsyncStorage
- **Images**: Use optimized image components
- **Animations**: Use `react-native-reanimated`
- **Haptics**: Add haptic feedback
- **Keyboard**: Better keyboard handling

## Key Differences

| Web                 | Mobile                       |
| ------------------- | ---------------------------- |
| Modal overlays      | Stack navigation             |
| State-based screens | Navigation-based screens     |
| localStorage        | SQLite/AsyncStorage          |
| CSS modules         | StyleSheet                   |
| `div`, `button`     | `View`, `TouchableOpacity`   |
| `img`               | `Image` with caching         |
| No back button      | Android back button handling |
| URL routing         | Deep linking                 |

## Recommended Approach

1. **Extract game logic first** into hooks/services
2. **Create navigation structure** with placeholder screens
3. **Migrate one screen at a time**:
   - Start with HomeScreen (simplest)
   - Then GameScreen (most complex)
   - Then EndScreen
   - Finally HistoryScreen and SettingsScreen
4. **Test navigation flow** between screens
5. **Add mobile-specific features** (haptics, animations)

This approach allows you to test incrementally and ensures the app works at each step!
