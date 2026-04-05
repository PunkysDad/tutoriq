import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../../interfaces/interfaces';
import { theme } from '../../theme';

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
  onPress?: () => void;
  isSelected?: boolean;
}

export default function TagChip({ tag, onRemove, onPress, isSelected }: TagChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {tag.name}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
          <Text style={[styles.removeText, isSelected && styles.chipTextSelected]}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '10',
    gap: theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  chipTextSelected: {
    color: theme.colors.textLight,
  },
  removeText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    lineHeight: theme.typography.fontSize.base,
  },
});
