import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

interface GradeLevelStepProps {
  selectedGrade: string | null;
  onSelectGrade: (grade: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GradeLevelStep({
  selectedGrade,
  onSelectGrade,
  onNext,
  onBack,
}: GradeLevelStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>What grade are you in?</Text>

        <View style={styles.grid}>
          {GRADES.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.tile,
                selectedGrade === grade && styles.tileSelected,
              ]}
              onPress={() => onSelectGrade(grade)}
            >
              <Text
                style={[
                  styles.tileText,
                  selectedGrade === grade && styles.tileTextSelected,
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selectedGrade && styles.buttonDisabled]}
          onPress={onNext}
          disabled={!selectedGrade}
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
    marginBottom: theme.spacing['2xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tileText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  tileTextSelected: {
    color: theme.colors.textLight,
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
