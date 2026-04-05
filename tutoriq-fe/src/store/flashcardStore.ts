import { create } from 'zustand';
import { FlashcardDeck, FlashcardCard, UpdateCardRequest } from '../interfaces/interfaces';
import flashcardService from '../services/flashcardService';
import { TrialLimitError } from '../services/apiService';

interface FlashcardState {
  decks: FlashcardDeck[];
  activeDeck: FlashcardDeck | null;
  gameCards: FlashcardCard[];
  isLoading: boolean;
  error: string | null;
  trialLimitHit: boolean;

  loadDecks: () => Promise<void>;
  createDeck: (title: string, subject: string | null) => Promise<void>;
  loadDeck: (deckId: number) => Promise<void>;
  updateDeck: (deckId: number, title: string, subject: string | null) => Promise<void>;
  deleteDeck: (deckId: number) => Promise<void>;
  createCard: (deckId: number, question: string, answer: string) => Promise<void>;
  updateCard: (deckId: number, cardId: number, payload: UpdateCardRequest) => Promise<void>;
  deleteCard: (deckId: number, cardId: number) => Promise<void>;
  loadGameCards: (deckId: number) => Promise<void>;
  clearActiveDeck: () => void;
  clearTrialLimit: () => void;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  decks: [],
  activeDeck: null,
  gameCards: [],
  isLoading: false,
  error: null,
  trialLimitHit: false,

  loadDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardService.getDecks();
      if (result.success) {
        set({ decks: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load decks', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createDeck: async (title, subject) => {
    set({ error: null, trialLimitHit: false });
    try {
      const result = await flashcardService.createDeck(title, subject);
      if (result.success) {
        set((s) => ({ decks: [result.data, ...s.decks] }));
      } else {
        set({ error: result.error || 'Failed to create deck' });
      }
    } catch (err: any) {
      if (err instanceof TrialLimitError) {
        set({ trialLimitHit: true });
      } else {
        set({ error: err.message || 'Failed to create deck' });
      }
    }
  },

  loadDeck: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardService.getDeck(deckId);
      if (result.success) {
        set({ activeDeck: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load deck', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateDeck: async (deckId, title, subject) => {
    try {
      const result = await flashcardService.updateDeck(deckId, title, subject);
      if (result.success) {
        set((s) => ({
          activeDeck: s.activeDeck?.id === deckId ? { ...s.activeDeck, ...result.data } : s.activeDeck,
          decks: s.decks.map((d) => (d.id === deckId ? { ...d, ...result.data } : d)),
        }));
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteDeck: async (deckId) => {
    try {
      await flashcardService.deleteDeck(deckId);
      set((s) => ({
        decks: s.decks.filter((d) => d.id !== deckId),
        activeDeck: s.activeDeck?.id === deckId ? null : s.activeDeck,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createCard: async (deckId, question, answer) => {
    try {
      const result = await flashcardService.createCard(deckId, question, answer);
      if (result.success) {
        set((s) => {
          const ad = s.activeDeck;
          if (ad && ad.id === deckId) {
            return {
              activeDeck: {
                ...ad,
                cards: [...(ad.cards ?? []), result.data],
                cardCount: ad.cardCount + 1,
              },
            };
          }
          return {};
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateCard: async (deckId, cardId, payload) => {
    try {
      const result = await flashcardService.updateCard(deckId, cardId, payload);
      if (result.success) {
        set((s) => {
          const ad = s.activeDeck;
          if (ad && ad.id === deckId && ad.cards) {
            return {
              activeDeck: {
                ...ad,
                cards: ad.cards.map((c) => (c.id === cardId ? result.data : c)),
              },
            };
          }
          return {};
        });
      }
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteCard: async (deckId, cardId) => {
    try {
      await flashcardService.deleteCard(deckId, cardId);
      set((s) => {
        const ad = s.activeDeck;
        if (ad && ad.id === deckId && ad.cards) {
          return {
            activeDeck: {
              ...ad,
              cards: ad.cards.filter((c) => c.id !== cardId),
              cardCount: ad.cardCount - 1,
            },
          };
        }
        return {};
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  loadGameCards: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardService.getGameCards(deckId);
      if (result.success) {
        set({ gameCards: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load game cards', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearActiveDeck: () => set({ activeDeck: null, gameCards: [] }),
  clearTrialLimit: () => set({ trialLimitHit: false }),
}));
