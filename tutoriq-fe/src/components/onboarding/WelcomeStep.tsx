import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>TutorIQ</Text>
        <Text style={styles.headline}>Welcome to TutorIQ</Text>
        <Text style={styles.subtext}>
          Your personal AI tutor that helps you learn — not just get answers.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
    marginBottom: theme.spacing['2xl'],
  },
  headline: {
    ...theme.typography.heading2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed(theme.typography.fontSize.base),
    paddingHorizontal: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
});
