import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  Alert, ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFlashcardStore } from '../../store/flashcardStore';
import { FlashcardCard } from '../../interfaces/interfaces';
import { FlashcardStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

type Route = RouteProp<FlashcardStackParamList, 'FlashcardDeckDetail'>;
type Nav = StackNavigationProp<FlashcardStackParamList>;

export default function FlashcardDeckDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { activeDeck, isLoading, loadDeck, createCard, updateCard, deleteCard, updateDeck, deleteDeck } = useFlashcardStore();

  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  useEffect(() => { loadDeck(params.deckId); }, [params.deckId]);

  const handleAddCard = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    await createCard(params.deckId, newQ.trim(), newA.trim());
    setNewQ(''); setNewA(''); setShowAddCard(false);
  };

  const handleEditDeck = async () => {
    if (!editTitle.trim()) return;
    await updateDeck(params.deckId, editTitle.trim(), activeDeck?.subject ?? null);
    setShowEditDeck(false);
  };

  const handleDeleteDeck = () => {
    Alert.alert('Delete Deck', 'This will delete the deck and all its cards.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDeck(params.deckId); navigation.goBack(); } },
    ]);
  };

  const handleDeleteCard = (cardId: number) => {
    Alert.alert('Delete Card', 'Delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCard(params.deckId, cardId) },
    ]);
  };

  const cards = activeDeck?.cards ?? [];

  const renderCard = ({ item }: { item: FlashcardCard }) => {
    const expanded = expandedCardId === item.id;
    return (
      <TouchableOpacity style={styles.cardRow} onPress={() => setExpandedCardId(expanded ? null : item.id)}>
        <View style={styles.cardContent}>
          <Text style={styles.cardQuestion}>{item.question}</Text>
          {expanded && <Text style={styles.cardAnswer}>{item.answer}</Text>}
        </View>
        <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading || !activeDeck) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deckTitle}>{activeDeck.title}</Text>
          {activeDeck.subject && <Text style={styles.subjectBadge}>{activeDeck.subject}</Text>}
        </View>
        <TouchableOpacity onPress={() => { setEditTitle(activeDeck.title); setShowEditDeck(true); }} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteDeck} style={styles.headerAction}>
          <Text style={[styles.headerActionText, { color: theme.colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Buttons */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => cards.length > 0 && navigation.navigate('FlashcardStudy', { deckId: params.deckId })}
          disabled={cards.length === 0}
        >
          <Text style={[styles.modeButtonText, cards.length === 0 && { opacity: 0.5 }]}>Study</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, styles.modeButtonPrimary]}
          onPress={() => cards.length >= 2 && navigation.navigate('FlashcardMatchGame', { deckId: params.deckId })}
          disabled={cards.length < 2}
        >
          <Text style={[styles.modeButtonTextPrimary, cards.length < 2 && { opacity: 0.5 }]}>Match Game</Text>
        </TouchableOpacity>
      </View>

      {/* Card List */}
      {cards.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No cards yet. Tap + Add Card to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c) => c.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add Card Button */}
      <TouchableOpacity style={styles.addCardButton} onPress={() => setShowAddCard(true)}>
        <Text style={styles.addCardText}>+ Add Card</Text>
      </TouchableOpacity>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Card</Text>
            <TextInput style={styles.modalInput} placeholder="Question" placeholderTextColor={theme.colors.textTertiary} value={newQ} onChangeText={setNewQ} multiline maxLength={1000} />
            <TextInput style={styles.modalInput} placeholder="Answer" placeholderTextColor={theme.colors.textTertiary} value={newA} onChangeText={setNewA} multiline maxLength={1000} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowAddCard(false); setNewQ(''); setNewA(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createButton, (!newQ.trim() || !newA.trim()) && styles.buttonDisabled]} onPress={handleAddCard} disabled={!newQ.trim() || !newA.trim()}>
                <Text style={styles.createButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Deck Modal */}
      <Modal visible={showEditDeck} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Deck</Text>
            <TextInput style={styles.modalInput} placeholder="Deck title" placeholderTextColor={theme.colors.textTertiary} value={editTitle} onChangeText={setEditTitle} maxLength={100} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowEditDeck(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.createButton, !editTitle.trim() && styles.buttonDisabled]} onPress={handleEditDeck} disabled={!editTitle.trim()}>
                <Text style={styles.createButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.base, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  deckTitle: { ...theme.typography.heading4, color: theme.colors.text },
  subjectBadge: { ...theme.typography.caption, color: theme.colors.primary, marginTop: theme.spacing.xs },
  headerAction: { paddingLeft: theme.spacing.md },
  headerActionText: { ...theme.typography.bodySmall, color: theme.colors.primary, fontWeight: theme.typography.fontWeight.medium },
  modeRow: { flexDirection: 'row', padding: theme.spacing.base, gap: theme.spacing.sm },
  modeButton: { flex: 1, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingVertical: theme.spacing.md, alignItems: 'center' },
  modeButtonPrimary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  modeButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
  modeButtonTextPrimary: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  list: { padding: theme.spacing.base },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: theme.spacing.base, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  cardContent: { flex: 1 },
  cardQuestion: { ...theme.typography.bodySmall, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
  cardAnswer: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  deleteText: { fontSize: 20, color: theme.colors.error, paddingLeft: theme.spacing.md },
  addCardButton: { padding: theme.spacing.base, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: 'center' },
  addCardText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: theme.spacing.xl },
  modalCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl },
  modalTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.base },
  modalInput: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base, padding: theme.spacing.md, ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.md, minHeight: 48 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: theme.spacing.lg },
  cancelText: { ...theme.typography.body, color: theme.colors.textSecondary },
  createButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  buttonDisabled: { opacity: 0.5 },
  createButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
});
