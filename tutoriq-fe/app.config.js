export default {
  expo: {
    name: "TutorIQ",
    slug: "tutoriq",
    version: "1.0.0",
    orientation: "portrait",
    jsEngine: "hermes",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tutoriq",
      // TODO: Add GoogleService-Info.plist for Firebase
      // googleServicesFile: "./GoogleService-Info.plist",
      icon: "./assets/icon.png",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.tutoriq",
      // TODO: Add google-services.json for Firebase
      // googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
    },
    extra: {
      apiBaseUrl:
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080",
      appEnv: process.env.APP_ENV || "development",
      eas: {
        // TODO: Set EAS project ID after running `eas init`
        projectId: "",
      },
      // TODO: Add Firebase config
      // firebaseConfig: {
      //   apiKey: "",
      //   projectId: "",
      //   storageBucket: "",
      //   iosClientId: "",
      //   iosBundleId: "com.tutoriq",
      // },
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
          },
          ios: {
            deploymentTarget: "15.1",
          },
        },
      ],
    ],
  },
};
