# Mimbel Mobile App

React Native mobile app built with Expo SDK 53 for the Mimbel flag quiz game.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli` or use `npx expo`
- Expo Go app on your mobile device (iOS/Android)

### Installation

1. Navigate to the mobileversion directory:

   ```bash
   cd mobileversion
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the `mobileversion` directory with your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

   Or update `app.config.js` with your credentials directly (not recommended for production).

4. Start the Expo development server:

   ```bash
   npm start
   ```

   Or use:

   ```bash
   npx expo start
   ```

5. Open the app:
   - Scan the QR code with Expo Go (iOS Camera app or Android Expo Go app)
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
mobileversion/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration
├── app.config.js        # Expo config with environment variables
├── babel.config.js      # Babel configuration
├── package.json         # Dependencies
├── src/
│   ├── screens/
│   │   └── HomeScreen.js    # Home screen with testing UI
│   └── services/
│       ├── supabase.js      # Supabase client setup
│       └── sync.js         # Flag sync service
└── assets/              # App icons and splash screens
```

## Features

### Current Implementation

1. **Home Screen** - Basic testing interface with:

   - Flag sync testing (sync flags from Supabase to local SQLite)
   - Game settings testing (configure game modes, types, continents, etc.)
   - Local flags display (shows synced flags count and sample data)

2. **Sync Service** - Handles:

   - Initial database setup (SQLite)
   - Syncing flags from Supabase
   - Storing flags locally for offline use
   - Tracking sync metadata

3. **Game Settings** - Test configuration for:
   - Game mode (Standard/Regional)
   - Game type (Flag→Country / Country→Flag)
   - Continent selection
   - Options (Territories, Infinite Mode, Time Attack, Typing Mode)

## Testing

### Test Flag Syncing

1. Open the app in Expo Go
2. On the home screen, you'll see:
   - Current local flags count
   - "Sync Flags" button
3. Tap "Sync Flags" to sync from Supabase
4. The sync status will show success/failure
5. Sample flags will appear below after successful sync

### Test Game Settings

1. Use the toggle buttons to change game settings
2. Tap "View Settings JSON" to see the current settings object
3. All settings are stored in component state (ready for game implementation)

## Next Steps

- [ ] Implement actual game screen
- [ ] Add navigation between screens
- [ ] Implement flag image caching
- [ ] Add regional flags sync
- [ ] Add continents sync
- [ ] Style the UI (import from web version)
- [ ] Add game history and statistics
- [ ] Add offline mode support

## Notes

- The sync service uses Expo SQLite SDK 53 synchronous API
- Supabase credentials need to be set in environment variables
- First sync will download all flags (may take a moment)
- Subsequent syncs only download changes since last sync

## Troubleshooting

### Sync not working

- Check that Supabase credentials are set correctly
- Verify network connection
- Check console logs for errors

### Database errors

- The app will create the database on first run
- If issues occur, you may need to clear app data and restart

### Expo Go issues

- Make sure you're using the latest Expo Go app
- Try clearing Expo Go cache: Settings → Clear cache
- Restart the Expo development server
