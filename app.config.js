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
      image: "./assets/images/icon.png",
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
      ],
      statusBar: {
        barStyle: "light-content",
        backgroundColor: "#78BBFF"
      }
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
        projectId: "460afa96-4595-4c00-87a4-607d46a2be91"
      }
    },
    updates: {
      url: "https://u.expo.dev/460afa96-4595-4c00-87a4-607d46a2be91",
      enabled: true,
      checkAutomatically: "ON_LOAD"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};