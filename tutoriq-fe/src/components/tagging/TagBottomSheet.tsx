import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTagStore } from '../../store/tagStore';
import { Tag } from '../../interfaces/interfaces';
import TagChip from './TagChip';
import { theme } from '../../theme';

interface TagBottomSheetProps {
  visible: boolean;
  sessionId: number | null;
  onClose: () => void;
}

export default function TagBottomSheet({ visible, sessionId, onClose }: TagBottomSheetProps) {
  const {
    tags,
    sessionTags,
    isLoading,
    loadTags,
    loadSessionTags,
    createTag,
    assignTags,
    removeTag,
  } = useTagStore();

  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const appliedTags = sessionId ? sessionTags[sessionId] ?? [] : [];
  const appliedTagIds = new Set(appliedTags.map((t) => t.id));
  const availableTags = tags.filter((t) => !appliedTagIds.has(t.id));

  useEffect(() => {
    if (visible && sessionId) {
      loadTags();
      loadSessionTags(sessionId);
    }
  }, [visible, sessionId]);

  const handleApplyTag = async (tagId: number) => {
    if (!sessionId) return;
    await assignTags(sessionId, [tagId]);
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!sessionId) return;
    await removeTag(sessionId, tagId);
  };

  const handleCreateTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) return;

    setIsCreating(true);
    await createTag(trimmed);
    setNewTagName('');
    setIsCreating(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Manage Tags</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <>
                {/* Applied Tags */}
                <Text style={styles.sectionTitle}>Applied Tags</Text>
                {appliedTags.length === 0 ? (
                  <Text style={styles.emptyText}>No tags applied to this session</Text>
                ) : (
                  <View style={styles.chipRow}>
                    {appliedTags.map((tag) => (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        isSelected
                        onRemove={() => handleRemoveTag(tag.id)}
                      />
                    ))}
                  </View>
                )}

                {/* Available Tags */}
                <Text style={styles.sectionTitle}>Your Tags</Text>
                {availableTags.length === 0 ? (
                  <Text style={styles.emptyText}>All tags are applied or create a new one below</Text>
                ) : (
                  <View style={styles.chipRow}>
                    {availableTags.map((tag) => (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        onPress={() => handleApplyTag(tag.id)}
                      />
                    ))}
                  </View>
                )}

                {/* Create Tag */}
                <View style={styles.createRow}>
                  <TextInput
                    style={styles.createInput}
                    placeholder="New tag name..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newTagName}
                    onChangeText={setNewTagName}
                    maxLength={50}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!newTagName.trim() || isCreating) && styles.addButtonDisabled,
                    ]}
                    onPress={handleCreateTag}
                    disabled={!newTagName.trim() || isCreating}
                  >
                    {isCreating ? (
                      <ActivityIndicator size="small" color={theme.colors.textLight} />
                    ) : (
                      <Text style={styles.addButtonText}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.heading4,
    color: theme.colors.text,
  },
  closeText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  centered: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  createInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.bodySmall,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
});
