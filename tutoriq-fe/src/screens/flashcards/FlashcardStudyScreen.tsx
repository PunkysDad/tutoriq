import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate,
} from 'react-native-reanimated';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useFlashcardStore } from '../../store/flashcardStore';
import { FlashcardStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

type Route = RouteProp<FlashcardStackParamList, 'FlashcardStudy'>;

export default function FlashcardStudyScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const { activeDeck, isLoading, loadDeck } = useFlashcardStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipProgress = useSharedValue(0);

  useEffect(() => { if (!activeDeck || activeDeck.id !== params.deckId) loadDeck(params.deckId); }, [params.deckId]);

  const cards = activeDeck?.cards ?? [];
  const card = cards[currentIndex];

  const handleFlip = () => {
    const next = isFlipped ? 0 : 1;
    flipProgress.value = withTiming(next, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setIsFlipped(false);
    flipProgress.value = withTiming(0, { duration: 200 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  if (isLoading || !card) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Card {currentIndex + 1} of {cards.length}</Text>

      <TouchableOpacity style={styles.cardWrapper} onPress={handleFlip} activeOpacity={0.9}>
        <Animated.View style={[styles.card, frontStyle]}>
          <Text style={styles.cardLabel}>Question</Text>
          <Text style={styles.cardText}>{card.question}</Text>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
          <Text style={styles.cardLabel}>Answer</Text>
          <Text style={styles.cardText}>{card.answer}</Text>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={() => currentIndex > 0 && goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentIndex === cards.length - 1 ? (
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={() => goTo(currentIndex + 1)}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
  cardWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    position: 'absolute', width: '100%', minHeight: 250,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.base,
  },
  cardBack: { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary },
  cardLabel: { ...theme.typography.caption, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textTertiary, marginBottom: theme.spacing.md },
  cardText: { ...theme.typography.heading4, color: theme.colors.text, textAlign: 'center', lineHeight: theme.typography.lineHeight.relaxed(theme.typography.fontSize.xl) },
  tapHint: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: theme.spacing.lg },
  controls: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
  navButton: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base, paddingVertical: theme.spacing.md, alignItems: 'center' },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.textSecondary },
  doneButton: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingVertical: theme.spacing.md, alignItems: 'center' },
  doneButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
});
