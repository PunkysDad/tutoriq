import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../../interfaces/interfaces';
import { theme } from '../../theme';

interface TagFilterBarProps {
  tags: Tag[];
  selectedTagId: number | null;
  onSelectTag: (tagId: number | null) => void;
}

export default function TagFilterBar({ tags, selectedTagId, onSelectTag }: TagFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        style={[styles.chip, selectedTagId === null && styles.chipActive]}
        onPress={() => onSelectTag(null)}
      >
        <Text style={[styles.chipText, selectedTagId === null && styles.chipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          style={[styles.chip, selectedTagId === tag.id && styles.chipActive]}
          onPress={() => onSelectTag(tag.id)}
        >
          <Text style={[styles.chipText, selectedTagId === tag.id && styles.chipTextActive]}>
            {tag.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  content: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.textLight,
  },
});
