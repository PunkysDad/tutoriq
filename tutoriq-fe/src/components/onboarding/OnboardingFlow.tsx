import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import WelcomeStep from './WelcomeStep';
import GradeLevelStep from './GradeLevelStep';
import SubjectPreferencesStep from './SubjectPreferencesStep';
import AllSetStep from './AllSetStep';
import userService from '../../services/userService';
import { theme } from '../../theme';

const TOTAL_STEPS = 4;
const ONBOARDING_KEY = 'tutoriq_onboarding_complete';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await userService.updateUserProfile({
        gradeLevel: gradeLevel ?? undefined,
        subjectPreferences: subjects,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep onNext={() => setStep(1)} />;
      case 1:
        return (
          <GradeLevelStep
            selectedGrade={gradeLevel}
            onSelectGrade={setGradeLevel}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        );
      case 2:
        return (
          <SubjectPreferencesStep
            selectedSubjects={subjects}
            onToggleSubject={handleToggleSubject}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <AllSetStep onFinish={handleFinish} isLoading={isLoading} error={error} />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {step + 1} of {TOTAL_STEPS}
        </Text>
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <Animated.View
        key={step}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(150)}
        style={styles.stepContainer}
      >
        {renderStep()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.sm,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  stepContainer: {
    flex: 1,
  },
});
