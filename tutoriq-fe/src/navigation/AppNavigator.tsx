import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import AuthenticationFlow from '../components/AuthenticationFlow';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import TutorScreen from '../screens/TutorScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FlashcardDeckListScreen from '../screens/flashcards/FlashcardDeckListScreen';
import FlashcardDeckDetailScreen from '../screens/flashcards/FlashcardDeckDetailScreen';
import FlashcardStudyScreen from '../screens/flashcards/FlashcardStudyScreen';
import FlashcardMatchGameScreen from '../screens/flashcards/FlashcardMatchGameScreen';
import ParentHomeScreen from '../screens/parent/ParentHomeScreen';
import ChildDashboardScreen from '../screens/parent/ChildDashboardScreen';
import { useAuth } from '../context/AuthContext';
import revenueCatService from '../services/revenueCatService';
import { theme } from '../theme';

const ONBOARDING_KEY = 'tutoriq_onboarding_complete';

// ─── Type exports ─────────────────────────────────────────────────

export type FlashcardStackParamList = {
  FlashcardDeckList: undefined;
  FlashcardDeckDetail: { deckId: number };
  FlashcardStudy: { deckId: number };
  FlashcardMatchGame: { deckId: number };
};

export type MainTabParamList = {
  TutorTab: undefined;
  FlashcardsTab: undefined;
  ProgressTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
};

export type ParentStackParamList = {
  ParentHome: undefined;
  ChildDashboard: { childId: number };
  Profile: undefined;
  Paywall: undefined;
};

// ─── Navigators ───────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<MainStackParamList>();
const FlashcardStack = createStackNavigator<FlashcardStackParamList>();
const ParentStack = createStackNavigator<ParentStackParamList>();

const headerDefaults = {
  headerStyle: { backgroundColor: theme.colors.background },
  headerTintColor: theme.colors.text,
  headerTitleStyle: { fontWeight: '600' as const },
};

// ─── Student Navigators ───────────────────────────────────────────

function FlashcardNavigator() {
  return (
    <FlashcardStack.Navigator screenOptions={headerDefaults}>
      <FlashcardStack.Screen name="FlashcardDeckList" component={FlashcardDeckListScreen} options={{ headerTitle: 'Flashcards' }} />
      <FlashcardStack.Screen name="FlashcardDeckDetail" component={FlashcardDeckDetailScreen} options={{ headerTitle: 'Deck' }} />
      <FlashcardStack.Screen name="FlashcardStudy" component={FlashcardStudyScreen} options={{ headerTitle: 'Study' }} />
      <FlashcardStack.Screen name="FlashcardMatchGame" component={FlashcardMatchGameScreen} options={{ headerTitle: 'Match Game' }} />
    </FlashcardStack.Navigator>
  );
}

function StudentTabs() {
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
      <Tab.Screen name="TutorTab" component={TutorScreen}
        options={{ tabBarLabel: 'Tutor', headerShown: true, headerTitle: 'AI Tutor', ...headerDefaults }} />
      <Tab.Screen name="FlashcardsTab" component={FlashcardNavigator}
        options={{ tabBarLabel: 'Flashcards' }} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen}
        options={{ tabBarLabel: 'Progress', headerShown: true, headerTitle: 'Progress', ...headerDefaults }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', headerShown: true, headerTitle: 'Profile', ...headerDefaults }} />
    </Tab.Navigator>
  );
}

function StudentNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={StudentTabs} />
      <RootStack.Screen name="Paywall" component={PaywallScreen}
        options={{ presentation: 'modal', headerShown: true, headerTitle: 'Upgrade', ...headerDefaults }} />
    </RootStack.Navigator>
  );
}

// ─── Parent Navigator ─────────────────────────────────────────────

function ParentNavigator() {
  return (
    <ParentStack.Navigator screenOptions={headerDefaults}>
      <ParentStack.Screen name="ParentHome" component={ParentHomeScreen}
        options={({ navigation }) => ({
          headerTitle: 'My Students',
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ paddingRight: theme.spacing.base }}>
              <Text style={{ ...theme.typography.bodySmall, color: theme.colors.primary }}>Profile</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <ParentStack.Screen name="ChildDashboard" component={ChildDashboardScreen} options={{ headerTitle: 'Activity' }} />
      <ParentStack.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: 'Profile' }} />
      <ParentStack.Screen name="Paywall" component={PaywallScreen}
        options={{ presentation: 'modal', headerTitle: 'Upgrade' }} />
    </ParentStack.Navigator>
  );
}

// ─── Root AppNavigator ────────────────────────────────────────────

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

    // Parents skip onboarding
    if (user?.role !== 'STUDENT') {
      setOnboardingComplete(true);
      return;
    }

    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    setOnboardingComplete(value === 'true');
  };

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading || (isAuthenticated && (onboardingComplete === null || !revenueCatReady))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ─── Unauthenticated ─────────────────────────────────────
  if (!isAuthenticated) {
    return <NavigationContainer><AuthenticationFlow /></NavigationContainer>;
  }

  // ─── Onboarding (students only) ──────────────────────────
  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />;
  }

  // ─── Role-based navigation ───────────────────────────────
  return (
    <NavigationContainer>
      {user?.role === 'PARENT' ? <ParentNavigator /> : <StudentNavigator />}
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
