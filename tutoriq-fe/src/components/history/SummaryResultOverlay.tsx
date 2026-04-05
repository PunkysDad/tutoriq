import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { theme } from '../../theme';

interface SummaryResultOverlayProps {
  visible: boolean;
  summary: string | null;
  cached?: boolean;
  onClose: () => void;
}

export default function SummaryResultOverlay({
  visible,
  summary,
  cached,
  onClose,
}: SummaryResultOverlayProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session Summary</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {cached && (
            <View style={styles.cachedBadge}>
              <Text style={styles.cachedText}>Cached</Text>
            </View>
          )}
          <Text style={styles.summaryText}>{summary}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  closeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    padding: theme.spacing.xl,
  },
  cachedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.info + '20',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.base,
  },
  cachedText: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.info,
  },
  summaryText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeight.relaxed(theme.typography.fontSize.base),
  },
});
