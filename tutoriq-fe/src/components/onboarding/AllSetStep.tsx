import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';

interface AllSetStepProps {
  onFinish: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AllSetStep({ onFinish, isLoading, error }: AllSetStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>You're all set!</Text>
        <Text style={styles.subtext}>
          TutorIQ is ready to help you learn. Ask your tutor anything — it won't give you the
          answer, but it will help you find it.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onFinish}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textLight} size="small" />
        ) : (
          <Text style={styles.buttonText}>Start Learning</Text>
        )}
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
});
