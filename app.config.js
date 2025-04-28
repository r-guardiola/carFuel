module.exports = {
  name: "CarFuel",
  slug: "carfuel",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",
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
    package: "com.meuapp.carfuel"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "b5b6e12c-bd23-424d-b114-8d1ee6c561a4"
    }
  },
  androidNavigationBar: {
    backgroundColor: "#FFFFFF"
  },
  androidStatusBar: {
    backgroundColor: "#FFFFFF",
    barStyle: "dark-content"
  }
}; 