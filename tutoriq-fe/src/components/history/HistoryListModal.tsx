import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useChatHistoryStore } from '../../store/chatHistoryStore';
import { useTagStore } from '../../store/tagStore';
import { useUpgrade } from '../../context/UpgradeContext';
import { ChatHistoryEntry } from '../../interfaces/interfaces';
import chatHistoryService from '../../services/chatHistoryService';
import tagService from '../../services/tagService';
import HistoryEntryRow from './HistoryEntryRow';
import SessionDetailOverlay from './SessionDetailOverlay';
import SummaryResultOverlay from './SummaryResultOverlay';
import TagFilterBar from '../tagging/TagFilterBar';
import TagBottomSheet from '../tagging/TagBottomSheet';
import { theme } from '../../theme';

interface HistoryListModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSession: (sessionId: number) => void;
}

export default function HistoryListModal({
  visible,
  onClose,
  onOpenSession,
}: HistoryListModalProps) {
  const { hasFeatureAccess } = useUpgrade();
  const canTag = hasFeatureAccess('ANSWER_TAGGING');

  const {
    entries,
    isLoading,
    isMultiSelectMode,
    selectedSessionIds,
    summaryResult,
    summaryCached,
    isSummarizing,
    error,
    loadHistory,
    toggleMultiSelectMode,
    toggleSessionSelection,
    generateSummary,
    deleteSession,
    clearSummary,
  } = useChatHistoryStore();

  const { tags, sessionTags, loadTags, loadSessionTags } = useTagStore();

  const [detailSessionId, setDetailSessionId] = useState<number | null>(null);
  const [tagSheetSessionId, setTagSheetSessionId] = useState<number | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<ChatHistoryEntry[] | null>(null);

  useEffect(() => {
    if (visible) {
      loadHistory();
      if (canTag) loadTags();
    } else {
      setSelectedTagId(null);
      setFilteredEntries(null);
    }
  }, [visible]);

  // Load session tags for visible entries
  useEffect(() => {
    if (canTag && visible) {
      const displayEntries = filteredEntries ?? entries;
      displayEntries.forEach((e) => {
        if (!sessionTags[e.sessionId]) {
          loadSessionTags(e.sessionId);
        }
      });
    }
  }, [entries, filteredEntries, visible, canTag]);

  const handleTagFilter = async (tagId: number | null) => {
    setSelectedTagId(tagId);
    if (tagId === null) {
      setFilteredEntries(null);
      loadHistory();
    } else {
      try {
        const result = await tagService.getHistoryByTag(tagId);
        if (result.success) {
          setFilteredEntries(result.data);
        }
      } catch {
        // fallback to unfiltered
      }
    }
  };

  const displayEntries = filteredEntries ?? entries;

  const handlePress = (entry: ChatHistoryEntry) => {
    if (isMultiSelectMode) {
      toggleSessionSelection(entry.sessionId);
    } else {
      setDetailSessionId(entry.sessionId);
    }
  };

  const handleLongPress = (entry: ChatHistoryEntry) => {
    if (!isMultiSelectMode) {
      toggleMultiSelectMode();
      toggleSessionSelection(entry.sessionId);
    }
  };

  const handleDelete = (sessionId: number) => {
    Alert.alert('Delete Session', 'This will permanently delete this session and its messages.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(sessionId) },
    ]);
  };

  const handleSummarize = async () => {
    await generateSummary();
  };

  const renderItem = ({ item }: { item: ChatHistoryEntry }) => (
    <HistoryEntryRow
      entry={item}
      isSelected={selectedSessionIds.includes(item.sessionId)}
      isMultiSelectMode={isMultiSelectMode}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
      onDelete={() => handleDelete(item.sessionId)}
      tags={canTag ? sessionTags[item.sessionId] : undefined}
      onTagPress={canTag ? () => setTagSheetSessionId(item.sessionId) : undefined}
    />
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat History</Text>
          {isMultiSelectMode ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[
                  styles.summarizeButton,
                  (selectedSessionIds.length === 0 || isSummarizing) && styles.buttonDisabled,
                ]}
                onPress={handleSummarize}
                disabled={selectedSessionIds.length === 0 || isSummarizing}
              >
                {isSummarizing ? (
                  <ActivityIndicator size="small" color={theme.colors.textLight} />
                ) : (
                  <Text style={styles.summarizeText}>
                    Summarize ({selectedSessionIds.length})
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMultiSelectMode}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Tag Filter Bar (PREMIUM only) */}
        {canTag && tags.length > 0 && (
          <TagFilterBar
            tags={tags}
            selectedTagId={selectedTagId}
            onSelectTag={handleTagFilter}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadHistory}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : displayEntries.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>
              {selectedTagId ? 'No sessions with this tag' : 'No chat history yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {selectedTagId
                ? 'Try a different tag or view all sessions.'
                : 'Start a tutoring session to save your first chat.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayEntries}
            keyExtractor={(item) => item.sessionId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>

      {/* Session Detail Overlay */}
      <SessionDetailOverlay
        visible={detailSessionId !== null}
        sessionId={detailSessionId}
        onClose={() => setDetailSessionId(null)}
      />

      {/* Summary Result Overlay */}
      <SummaryResultOverlay
        visible={summaryResult !== null}
        summary={summaryResult}
        cached={summaryCached}
        onClose={clearSummary}
      />

      {/* Tag Bottom Sheet */}
      <TagBottomSheet
        visible={tagSheetSessionId !== null}
        sessionId={tagSheetSessionId}
        onClose={() => setTagSheetSessionId(null)}
      />
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
  headerButton: {
    width: 60,
  },
  headerButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summarizeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  summarizeText: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
  cancelText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  list: {
    padding: theme.spacing.base,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  emptyTitle: {
    ...theme.typography.heading4,
    color: theme.colors.text,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
