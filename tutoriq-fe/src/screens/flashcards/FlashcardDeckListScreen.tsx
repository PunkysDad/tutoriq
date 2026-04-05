import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFlashcardStore } from '../../store/flashcardStore';
import { useUpgrade } from '../../context/UpgradeContext';
import TrialLimitModal from '../../components/TrialLimitModal';
import { FlashcardDeck } from '../../interfaces/interfaces';
import { FlashcardStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

const SUBJECTS = ['MATH', 'SCIENCE', 'ENGLISH', 'HISTORY'];

type Nav = StackNavigationProp<FlashcardStackParamList>;

export default function FlashcardDeckListScreen() {
  const navigation = useNavigation<Nav>();
  const { hasFeatureAccess } = useUpgrade();
  const {
    decks, isLoading, error, trialLimitHit,
    loadDecks, createDeck, deleteDeck, clearTrialLimit,
  } = useFlashcardStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<string | null>(null);

  useEffect(() => { loadDecks(); }, []);

  if (!hasFeatureAccess('FLASHCARDS')) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.upgradeTitle}>Premium Feature</Text>
        <Text style={styles.upgradeSubtext}>
          Flashcards require a Premium subscription.
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Paywall' as any)}
        >
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createDeck(newTitle.trim(), newSubject);
    setShowCreate(false);
    setNewTitle('');
    setNewSubject(null);
  };

  const handleDelete = (deckId: number) => {
    Alert.alert('Delete Deck', 'This will delete the deck and all its cards.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDeck(deckId) },
    ]);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const renderDeck = ({ item }: { item: FlashcardDeck }) => (
    <TouchableOpacity
      style={styles.deckCard}
      onPress={() => navigation.navigate('FlashcardDeckDetail', { deckId: item.id })}
    >
      <View style={styles.deckContent}>
        <Text style={styles.deckTitle}>{item.title}</Text>
        <View style={styles.deckMeta}>
          {item.subject && <Text style={styles.subjectBadge}>{item.subject}</Text>}
          <Text style={styles.metaText}>{item.cardCount} cards</Text>
          <Text style={styles.metaText}>· {formatDate(item.updatedAt)}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadDecks}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : decks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No flashcard decks yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first deck.</Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(d) => d.id.toString()}
          renderItem={renderDeck}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Deck</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Deck title"
              placeholderTextColor={theme.colors.textTertiary}
              value={newTitle}
              onChangeText={setNewTitle}
              maxLength={100}
            />
            <Text style={styles.modalLabel}>Subject (optional)</Text>
            <View style={styles.subjectRow}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.subjectChip, newSubject === s && styles.subjectChipActive]}
                  onPress={() => setNewSubject(newSubject === s ? null : s)}
                >
                  <Text style={[styles.subjectChipText, newSubject === s && styles.subjectChipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowCreate(false); setNewTitle(''); setNewSubject(null); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, !newTitle.trim() && styles.buttonDisabled]}
                onPress={handleCreate}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TrialLimitModal
        visible={trialLimitHit}
        onClose={clearTrialLimit}
        onUpgrade={() => { clearTrialLimit(); navigation.navigate('Paywall' as any); }}
        limitType="FLASHCARD_SETS"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  list: { padding: theme.spacing.base },
  deckCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base, marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm,
  },
  deckContent: { flex: 1 },
  deckTitle: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  deckMeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  subjectBadge: { ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.primary, backgroundColor: theme.colors.primary + '15', paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.borderRadius.sm, overflow: 'hidden' },
  metaText: { ...theme.typography.caption, color: theme.colors.textTertiary },
  deleteText: { ...theme.typography.caption, color: theme.colors.error, fontWeight: theme.typography.fontWeight.medium },
  fab: { position: 'absolute', bottom: theme.spacing.xl, right: theme.spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.lg },
  fabText: { fontSize: 28, color: theme.colors.textLight, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: theme.spacing.xl },
  modalCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl },
  modalTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.base },
  modalInput: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base, padding: theme.spacing.md, ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.base },
  modalLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  subjectChip: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  subjectChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  subjectChipText: { ...theme.typography.caption, color: theme.colors.textSecondary },
  subjectChipTextActive: { color: theme.colors.textLight },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: theme.spacing.lg },
  cancelText: { ...theme.typography.body, color: theme.colors.textSecondary },
  createButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  buttonDisabled: { opacity: 0.5 },
  createButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  upgradeTitle: { ...theme.typography.heading3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  upgradeSubtext: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
  upgradeButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  upgradeButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  emptyTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.sm },
  emptySubtext: { ...theme.typography.body, color: theme.colors.textSecondary },
  errorText: { ...theme.typography.body, color: theme.colors.error },
  retryText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary, marginTop: theme.spacing.sm },
});
