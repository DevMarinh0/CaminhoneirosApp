module.exports = {
  expo: {
    name: "Caminhoneiros App",
    slug: "caminhoneiros-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#78BBFF"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#78BBFF"
      },
      package: "com.bruno_marinho.caminhoneirosapp",
      versionCode: 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    extra: {
      apiUrl: "https://caminhoneiros-backend.onrender.com",
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};