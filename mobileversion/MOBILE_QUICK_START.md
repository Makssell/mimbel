# Mobile App Quick Start Guide

## TL;DR - What You Need to Know

### ✅ What Works Great for Mobile

- **Game logic**: 95% reusable from `site1.js`
- **State management**: useState hooks work fine (or upgrade to Zustand)
- **Components**: Most UI components can be adapted
- **Data structure**: Supabase schema works perfectly

### 🔄 What Needs to Change

1. **Navigation**: Replace modal overlays with React Navigation
2. **Storage**: Replace localStorage with SQLite for offline data
3. **Styling**: Convert CSS modules to React Native StyleSheet
4. **Images**: Download and cache images locally
5. **Sync**: Implement incremental sync mechanism

### 💡 Your Sync Idea is Perfect!

- Store all flag data locally (SQLite)
- Sync on app launch (if online)
- Only download changes since last sync
- App works 100% offline after initial sync

## Recommended Tech Stack

**Framework**: React Native with Expo (easiest to start)

```bash
npx create-expo-app mimbel-mobile
```

**Key Packages**:

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-navigation/stack": "^6.x",
    "expo-sqlite": "~13.x",
    "expo-image": "~1.x",
    "@supabase/supabase-js": "^2.x",
    "expo-haptics": "~13.x",
    "react-native-reanimated": "~3.x"
  }
}
```

## Project Structure

```
mimbel-mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.js
│   │   ├── GameScreen.js    # Main game (from site1.js)
│   │   ├── EndScreen.js
│   │   ├── HistoryScreen.js
│   │   └── SettingsScreen.js
│   ├── components/       # Reusable components
│   ├── hooks/           # Custom hooks
│   │   ├── useGame.js    # Game logic (extracted from site1.js)
│   │   └── useSync.js    # Sync logic
│   ├── services/        # Business logic
│   │   ├── database.js   # SQLite operations
│   │   ├── sync.js       # Sync service
│   │   └── flags.js      # Flag loading
│   └── navigation/      # Navigation setup
│       └── AppNavigator.js
```

## Migration Steps

### Step 1: Extract Game Logic (1-2 days)

Extract reusable game logic from `site1.js` into hooks:

```javascript
// hooks/useGame.js
export const useGame = (settings) => {
  // Extract game state and logic from site1.js
  // Make it reusable and testable
};
```

### Step 2: Set Up Mobile Project (1 day)

- Create Expo project
- Set up navigation structure
- Create placeholder screens
- Set up SQLite database

### Step 3: Implement Data Layer (2-3 days)

- Create database schema
- Implement sync service
- Test offline functionality
- Download and cache images

### Step 4: Migrate Screens (1 week)

- HomeScreen (game mode selection)
- GameScreen (main game - most complex)
- EndScreen (results)
- HistoryScreen (history & stats)
- SettingsScreen (settings)

### Step 5: Polish & Test (1 week)

- Add haptic feedback
- Optimize performance
- Test on iOS and Android
- App store assets

## Key Code Patterns

### Converting Web to Mobile

**Web (site1.js)**:

```javascript
<div className={styles.container}>
  <button onClick={handleClick}>Click</button>
  <img src={flag.image_url} />
</div>
```

**Mobile**:

```javascript
import { View, TouchableOpacity, Text, Image } from "react-native";
import { styles } from "./styles";

<View style={styles.container}>
  <TouchableOpacity onPress={handleClick}>
    <Text>Click</Text>
  </TouchableOpacity>
  <Image source={{ uri: flag.local_image_path }} />
</View>;
```

### Navigation Pattern

**Web (state-based)**:

```javascript
const [showEndScreen, setShowEndScreen] = useState(false);
if (showEndScreen) return <EndScreen />;
```

**Mobile (navigation-based)**:

```javascript
import { useNavigation } from "@react-navigation/native";
const navigation = useNavigation();
navigation.navigate("End", { gameStats });
```

### Storage Pattern

**Web**:

```javascript
localStorage.setItem("gameHistory", JSON.stringify(history));
const history = JSON.parse(localStorage.getItem("gameHistory") || "[]");
```

**Mobile (SQLite)**:

```javascript
import Database from "../services/database";
await Database.saveGameHistory(history);
const history = await Database.getGameHistory();
```

## Sync Implementation Summary

1. **First Launch**: Download all data (~50-100MB)
2. **Subsequent Launches**:
   - Check if online
   - If online: Sync changes since last sync (~few KB)
   - If offline: Use local data
3. **Manual Sync**: User can force sync from Settings

## Estimated Timeline

- **Week 1**: Setup, data layer, sync mechanism
- **Week 2**: Migrate HomeScreen and GameScreen
- **Week 3**: Migrate remaining screens, polish
- **Week 4**: Testing, optimization, app store prep

**Total**: ~4 weeks for MVP, 6-8 weeks for polished app

## Next Steps

1. ✅ Read the detailed analysis documents
2. ⬜ Decide on React Native (Expo) vs other framework
3. ⬜ Set up Expo project
4. ⬜ Extract game logic into hooks
5. ⬜ Implement sync mechanism
6. ⬜ Start migrating screens one by one

## Questions to Answer

1. **Do you want to maintain both web and mobile?**

   - If yes: Consider monorepo or shared business logic

2. **App Store Strategy?**

   - iOS App Store
   - Google Play Store
   - Both

3. **Monetization?**

   - Free
   - Paid
   - In-app purchases
   - Ads

4. **Target Users?**
   - General public
   - Students
   - Geography enthusiasts

## Resources

- **React Navigation**: https://reactnavigation.org/
- **Expo SQLite**: https://docs.expo.dev/versions/latest/sdk/sqlite/
- **Expo Image**: https://docs.expo.dev/versions/latest/sdk/image/
- **Supabase JS**: https://supabase.com/docs/reference/javascript/introduction

## Support

The architecture you have is actually very mobile-friendly! The main work is:

1. Setting up the mobile project structure
2. Implementing local storage and sync
3. Adapting the UI for mobile (navigation, touch targets)
4. Extracting reusable game logic

Your sync idea is exactly right - it's the modern way to build mobile apps!
