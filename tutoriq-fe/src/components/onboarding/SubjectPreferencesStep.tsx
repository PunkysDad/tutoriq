import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const SUBJECTS = [
  { label: 'Mathematics', value: 'MATH' },
  { label: 'Science', value: 'SCIENCE' },
  { label: 'English / Writing', value: 'ENGLISH' },
  { label: 'History / Social Studies', value: 'HISTORY' },
];

interface SubjectPreferencesStepProps {
  selectedSubjects: string[];
  onToggleSubject: (subject: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SubjectPreferencesStep({
  selectedSubjects,
  onToggleSubject,
  onNext,
  onBack,
}: SubjectPreferencesStepProps) {
  const hasSelection = selectedSubjects.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>What subjects do you want help with?</Text>
        <Text style={styles.subtext}>Select one or more</Text>

        <View style={styles.list}>
          {SUBJECTS.map((subject) => {
            const isSelected = selectedSubjects.includes(subject.value);
            return (
              <TouchableOpacity
                key={subject.value}
                style={[styles.tile, isSelected && styles.tileSelected]}
                onPress={() => onToggleSubject(subject.value)}
              >
                <Text style={[styles.tileText, isSelected && styles.tileTextSelected]}>
                  {subject.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !hasSelection && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!hasSelection}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  },
  headline: {
    ...theme.typography.heading2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  list: {
    gap: theme.spacing.md,
  },
  tile: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.base,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  tileSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  tileText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  tileTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  continueButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
});
