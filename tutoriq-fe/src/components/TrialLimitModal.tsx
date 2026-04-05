import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { theme } from '../theme';

interface TrialLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  limitType: 'AI_QUESTIONS' | 'FLASHCARD_SETS';
}

const MESSAGES: Record<TrialLimitModalProps['limitType'], { title: string; body: string }> = {
  AI_QUESTIONS: {
    title: 'Free Questions Used',
    body: "You've used all 4 of your free questions. Upgrade to keep learning.",
  },
  FLASHCARD_SETS: {
    title: 'Free Flashcard Set Used',
    body: "You've used your free flashcard set. Upgrade to create unlimited sets.",
  },
};

export default function TrialLimitModal({
  visible,
  onClose,
  onUpgrade,
  limitType,
}: TrialLimitModalProps) {
  const { title, body } = MESSAGES[limitType];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  title: {
    ...theme.typography.heading3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed(theme.typography.fontSize.base),
    marginBottom: theme.spacing.xl,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  upgradeButtonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
  laterButton: {
    paddingVertical: theme.spacing.sm,
  },
  laterButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});
