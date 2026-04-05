import Constants from 'expo-constants';

interface EnvironmentConfig {
  API_BASE_URL: string;
  REVENUECAT_API_KEY_IOS: string;
  REVENUECAT_API_KEY_ANDROID: string;
}

const extra = Constants.expoConfig?.extra ?? {};

export const ENV_CONFIG: EnvironmentConfig = {
  API_BASE_URL:
    extra.apiBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'http://localhost:8080',
  REVENUECAT_API_KEY_IOS:
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '',
  REVENUECAT_API_KEY_ANDROID:
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '',
};

if (__DEV__) {
  console.log('Environment Config:', {
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    REVENUECAT_IOS_SET: !!ENV_CONFIG.REVENUECAT_API_KEY_IOS,
    REVENUECAT_ANDROID_SET: !!ENV_CONFIG.REVENUECAT_API_KEY_ANDROID,
  });
}

export default ENV_CONFIG;
