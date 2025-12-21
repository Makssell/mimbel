# Quick Setup Guide

## 1. Install Dependencies

```bash
cd mobileversion
npm install
```

## 2. Configure Supabase

You need to set your Supabase credentials. You can find these in your root project's environment or Supabase dashboard.

### Option A: Create .env file (Recommended)

Create a `.env` file in the `mobileversion` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key-here
```

### Option B: Update app.config.js

Edit `app.config.js` and add your credentials to the `extra` section:

```javascript
extra: {
  supabaseUrl: "https://your-project.supabase.co",
  supabaseKey: "your-anon-key-here",
},
```

**Note:** If you're using the same Supabase project as the web version, you can copy the values from your root `.env` file, but change the prefix from `NEXT_PUBLIC_` to `EXPO_PUBLIC_`.

## 3. Start the App

```bash
npm start
```

Then:

- Scan QR code with Expo Go app (iOS/Android)
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

## 4. Test the Implementation

### Test Flag Sync

1. Open the app
2. Tap "Sync Flags" button
3. Wait for sync to complete
4. Check that flags count increases
5. View sample flags below

### Test Game Settings

1. Toggle different game settings
2. Tap "View Settings JSON" to see current configuration
3. Verify all settings are being tracked correctly

## Troubleshooting

### "Supabase URL or Key not found" warning

- Make sure you've created `.env` file or updated `app.config.js`
- Restart Expo dev server after adding environment variables
- Check that variable names start with `EXPO_PUBLIC_`

### Sync fails

- Check internet connection
- Verify Supabase credentials are correct
- Check console logs for detailed error messages
- Ensure Supabase project is accessible

### Database errors

- The database is created automatically on first run
- If issues persist, try clearing Expo Go app data

## Next Steps

Once basic sync and settings are working:

1. Test with actual game logic
2. Import styles from web version
3. Add navigation
4. Implement full game screen
