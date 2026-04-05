import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import AuthenticationFlow from '../components/AuthenticationFlow';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import TutorScreen from '../screens/TutorScreen';
import PaywallScreen from '../screens/PaywallScreen';
import FlashcardDeckListScreen from '../screens/flashcards/FlashcardDeckListScreen';
import FlashcardDeckDetailScreen from '../screens/flashcards/FlashcardDeckDetailScreen';
import FlashcardStudyScreen from '../screens/flashcards/FlashcardStudyScreen';
import FlashcardMatchGameScreen from '../screens/flashcards/FlashcardMatchGameScreen';
import ProgressScreen from '../screens/ProgressScreen';
import { useAuth } from '../context/AuthContext';
import revenueCatService from '../services/revenueCatService';
import { theme } from '../theme';

const ONBOARDING_KEY = 'tutoriq_onboarding_complete';

// Flashcard sub-stack param list
export type FlashcardStackParamList = {
  FlashcardDeckList: undefined;
  FlashcardDeckDetail: { deckId: number };
  FlashcardStudy: { deckId: number };
  FlashcardMatchGame: { deckId: number };
  Paywall: undefined;
};

// Main tab param list
export type MainTabParamList = {
  TutorTab: undefined;
  FlashcardsTab: undefined;
  ProgressTab: undefined;
};

// Root stack wrapping tabs + modals
export type MainStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<MainStackParamList>();
const FlashcardStack = createStackNavigator<FlashcardStackParamList>();

function FlashcardNavigator() {
  return (
    <FlashcardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: theme.typography.fontWeight.semibold },
      }}
    >
      <FlashcardStack.Screen
        name="FlashcardDeckList"
        component={FlashcardDeckListScreen}
        options={{ headerTitle: 'Flashcards' }}
      />
      <FlashcardStack.Screen
        name="FlashcardDeckDetail"
        component={FlashcardDeckDetailScreen}
        options={{ headerTitle: 'Deck' }}
      />
      <FlashcardStack.Screen
        name="FlashcardStudy"
        component={FlashcardStudyScreen}
        options={{ headerTitle: 'Study' }}
      />
      <FlashcardStack.Screen
        name="FlashcardMatchGame"
        component={FlashcardMatchGameScreen}
        options={{ headerTitle: 'Match Game' }}
      />
    </FlashcardStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TutorTab"
        component={TutorScreen}
        options={{
          tabBarLabel: 'Tutor',
          headerShown: true,
          headerTitle: 'AI Tutor',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: theme.typography.fontWeight.semibold },
        }}
      />
      <Tab.Screen
        name="FlashcardsTab"
        component={FlashcardNavigator}
        options={{ tabBarLabel: 'Flashcards' }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          headerShown: true,
          headerTitle: 'Progress',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: theme.typography.fontWeight.semibold },
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal', headerShown: true, headerTitle: 'Upgrade', headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.text }}
      />
    </RootStack.Navigator>
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
