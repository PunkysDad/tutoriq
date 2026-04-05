import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import AuthenticationFlow from '../components/AuthenticationFlow';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import TutorScreen from '../screens/TutorScreen';
import PaywallScreen from '../screens/PaywallScreen';
import { useAuth } from '../context/AuthContext';
import revenueCatService from '../services/revenueCatService';
import { theme } from '../theme';

const ONBOARDING_KEY = 'tutoriq_onboarding_complete';

export type MainStackParamList = {
  Tutor: undefined;
  Paywall: undefined;
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
      <MainStack.Screen
        name="Tutor"
        component={TutorScreen}
        options={{ headerTitle: 'AI Tutor' }}
      />
      <MainStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal', headerTitle: 'Upgrade' }}
      />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [revenueCatReady, setRevenueCatReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      initPostAuth();
    } else {
      setOnboardingComplete(null);
      setRevenueCatReady(false);
    }
  }, [isAuthenticated, user]);

  const initPostAuth = async () => {
    await revenueCatService.configurePurchases(user!.id.toString());
    setRevenueCatReady(true);

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

  if (isLoading || (isAuthenticated && (onboardingComplete === null || !revenueCatReady))) {
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
