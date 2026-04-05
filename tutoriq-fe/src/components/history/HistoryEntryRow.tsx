import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChatHistoryEntry, Tag } from '../../interfaces/interfaces';
import TagChip from '../tagging/TagChip';
import { theme } from '../../theme';

interface HistoryEntryRowProps {
  entry: ChatHistoryEntry;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
  tags?: Tag[];
  onTagPress?: () => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export default function HistoryEntryRow({
  entry,
  isSelected,
  isMultiSelectMode,
  onPress,
  onLongPress,
  onDelete,
  tags,
  onTagPress,
}: HistoryEntryRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {isMultiSelectMode && (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {entry.title || 'Untitled Session'}
        </Text>
        <View style={styles.meta}>
          {entry.subject && <Text style={styles.subject}>{entry.subject}</Text>}
          <Text style={styles.metaText}>
            {entry.messageCount} messages · {formatDate(entry.lastMessageAt)}
          </Text>
        </View>
        {tags && tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsRow}
            contentContainerStyle={styles.tagsRowContent}
          >
            {tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.actions}>
        {onTagPress && !isMultiSelectMode && (
          <TouchableOpacity style={styles.tagButton} onPress={onTagPress}>
            <Text style={styles.tagButtonText}>Tag</Text>
          </TouchableOpacity>
        )}
        {!isMultiSelectMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  subject: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  tagsRow: {
    flexGrow: 0,
    marginTop: theme.spacing.sm,
  },
  tagsRowContent: {
    gap: theme.spacing.xs,
  },
  actions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  tagButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  tagButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  deleteButton: {},
  deleteText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
