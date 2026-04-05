import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useFlashcardStore } from '../../store/flashcardStore';
import { FlashcardCard } from '../../interfaces/interfaces';
import { FlashcardStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

type Route = RouteProp<FlashcardStackParamList, 'FlashcardMatchGame'>;

interface Tile {
  key: string;
  cardId: number;
  text: string;
  type: 'question' | 'answer';
}

export default function FlashcardMatchGameScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const { gameCards, isLoading, loadGameCards } = useFlashcardStore();

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);

  useEffect(() => { loadGameCards(params.deckId); }, [params.deckId]);

  useEffect(() => {
    if (gameCards.length > 0) {
      const t: Tile[] = [];
      gameCards.forEach((c) => {
        t.push({ key: `q-${c.id}`, cardId: c.id, text: c.question, type: 'question' });
        t.push({ key: `a-${c.id}`, cardId: c.id, text: c.answer, type: 'answer' });
      });
      // Shuffle
      for (let i = t.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [t[i], t[j]] = [t[j], t[i]];
      }
      setTiles(t);
      setMatched(new Set());
      setSelected(null);
      setMoves(0);
      setWrongPair(new Set());
    }
  }, [gameCards]);

  const allMatched = matched.size === gameCards.length && gameCards.length > 0;

  const handleTap = useCallback((tile: Tile) => {
    if (matched.has(tile.cardId) && tiles.filter((t) => t.cardId === tile.cardId && !matched.has(t.cardId)).length === 0) return;
    if (wrongPair.size > 0) return;

    if (!selected) {
      setSelected(tile);
      return;
    }

    if (selected.key === tile.key) return;

    setMoves((m) => m + 1);

    if (selected.cardId === tile.cardId && selected.type !== tile.type) {
      // Match
      setMatched((prev) => new Set(prev).add(tile.cardId));
      setSelected(null);
    } else {
      // Wrong
      setWrongPair(new Set([selected.key, tile.key]));
      setTimeout(() => {
        setWrongPair(new Set());
        setSelected(null);
      }, 600);
    }
  }, [selected, matched, wrongPair, tiles]);

  const resetGame = () => {
    loadGameCards(params.deckId);
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (allMatched) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.winTitle}>You matched them all!</Text>
        <Text style={styles.winSubtext}>Completed in {moves} moves</Text>
        <View style={styles.winActions}>
          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderTile = ({ item }: { item: Tile }) => {
    const isMatched = matched.has(item.cardId);
    const isSelected = selected?.key === item.key;
    const isWrong = wrongPair.has(item.key);

    return (
      <TouchableOpacity
        style={[
          styles.tile,
          isMatched && styles.tileMatched,
          isSelected && styles.tileSelected,
          isWrong && styles.tileWrong,
        ]}
        onPress={() => !isMatched && handleTap(item)}
        disabled={isMatched}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.tileLabel,
          item.type === 'question' ? styles.tileLabelQ : styles.tileLabelA,
          isMatched && styles.tileTextMatched,
        ]}>
          {item.type === 'question' ? 'Q' : 'A'}
        </Text>
        <Text
          style={[styles.tileText, isMatched && styles.tileTextMatched]}
          numberOfLines={3}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.moveCounter}>Moves: {moves}</Text>
      <FlatList
        data={tiles}
        keyExtractor={(t) => t.key}
        renderItem={renderTile}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  moveCounter: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.md },
  grid: { padding: theme.spacing.sm },
  gridRow: { gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  tile: {
    flex: 1, minHeight: 100,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    borderWidth: 2, borderColor: theme.colors.border,
    padding: theme.spacing.md, justifyContent: 'center', alignItems: 'center',
  },
  tileSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
  tileMatched: { borderColor: theme.colors.success, backgroundColor: theme.colors.success + '15', opacity: 0.7 },
  tileWrong: { borderColor: theme.colors.error, backgroundColor: theme.colors.error + '10' },
  tileLabel: { ...theme.typography.caption, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing.xs },
  tileLabelQ: { color: theme.colors.primary },
  tileLabelA: { color: theme.colors.info },
  tileText: { ...theme.typography.caption, color: theme.colors.text, textAlign: 'center' },
  tileTextMatched: { color: theme.colors.success },
  winTitle: { ...theme.typography.heading2, color: theme.colors.text, marginBottom: theme.spacing.sm },
  winSubtext: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing['2xl'] },
  winActions: { flexDirection: 'row', gap: theme.spacing.md },
  playAgainButton: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  playAgainText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
  doneButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  doneButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
});
