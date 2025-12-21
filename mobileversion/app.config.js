export default {
  expo: {
    name: "Mimbel",
    slug: "mimbel-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0a0a0a"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mimbel.app",
      userInterfaceStyle: "dark"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0a0a0a"
      },
      package: "com.mimbel.app",
      navigationBar: {
        backgroundColor: "#0a0a0a"
      }
    },
    web: {
      favicon: "./assets/icon.png"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    },
  }
};
