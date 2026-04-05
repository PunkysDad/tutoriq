import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import AuthenticationFlow from '../components/AuthenticationFlow';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

const ONBOARDING_KEY = 'tutoriq_onboarding_complete';

export type MainStackParamList = {
  Home: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: theme.typography.fontWeight.semibold },
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkOnboarding();
    } else {
      setOnboardingComplete(null);
    }
  }, [isAuthenticated, user]);

  const checkOnboarding = async () => {
    if (user?.role !== 'STUDENT') {
      setOnboardingComplete(true);
      return;
    }

    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    setOnboardingComplete(value === 'true');
  };

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  if (isLoading || (isAuthenticated && onboardingComplete === null)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthenticationFlow />
      </NavigationContainer>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
