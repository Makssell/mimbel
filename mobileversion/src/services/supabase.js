import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get Supabase URL and key from environment variables
// For Expo, you can use app.config.js or .env file
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "";

const supabaseKey = 
  Constants.expoConfig?.extra?.supabaseKey || 
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ Supabase URL or Key not found!\n" +
    "Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in:\n" +
    "1. .env file (recommended)\n" +
    "2. app.config.js extra section\n" +
    "3. Environment variables"
  );
}

// Create client with empty strings if not configured (will fail gracefully on use)
export const supabase = createClient(supabaseUrl, supabaseKey);
