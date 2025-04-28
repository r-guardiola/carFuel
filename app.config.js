module.exports = {
  name: "CarFuel",
  slug: "carfuel",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.carfuel.app"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "your-project-id"
    }
  },
  androidNavigationBar: {
    backgroundColor: "#FFFFFF"
  },
  androidStatusBar: {
    backgroundColor: "#FFFFFF",
    barStyle: "dark-content"
  },
  // Configuração para Windows
  expo: {
    android: {
      adbPath: process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}\\platform-tools\\adb.exe` : undefined
    }
  }
}; 