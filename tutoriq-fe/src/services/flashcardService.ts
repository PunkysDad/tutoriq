import apiService, { ApiResponse } from './apiService';
import { FlashcardDeck, FlashcardCard, UpdateCardRequest } from '../interfaces/interfaces';

export const flashcardService = {
  async getDecks(): Promise<ApiResponse<FlashcardDeck[]>> {
    return apiService.get<FlashcardDeck[]>('/api/flashcards/decks');
  },

  async createDeck(title: string, subject: string | null): Promise<ApiResponse<FlashcardDeck>> {
    return apiService.post<FlashcardDeck>('/api/flashcards/decks', { title, subject });
  },

  async getDeck(deckId: number): Promise<ApiResponse<FlashcardDeck>> {
    return apiService.get<FlashcardDeck>(`/api/flashcards/decks/${deckId}`);
  },

  async updateDeck(deckId: number, title: string, subject: string | null): Promise<ApiResponse<FlashcardDeck>> {
    return apiService.put<FlashcardDeck>(`/api/flashcards/decks/${deckId}`, { title, subject });
  },

  async deleteDeck(deckId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/flashcards/decks/${deckId}`);
  },

  async createCard(deckId: number, question: string, answer: string): Promise<ApiResponse<FlashcardCard>> {
    return apiService.post<FlashcardCard>(`/api/flashcards/decks/${deckId}/cards`, { question, answer });
  },

  async updateCard(deckId: number, cardId: number, payload: UpdateCardRequest): Promise<ApiResponse<FlashcardCard>> {
    return apiService.put<FlashcardCard>(`/api/flashcards/decks/${deckId}/cards/${cardId}`, payload);
  },

  async deleteCard(deckId: number, cardId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/flashcards/decks/${deckId}/cards/${cardId}`);
  },

  async getGameCards(deckId: number): Promise<ApiResponse<FlashcardCard[]>> {
    return apiService.get<FlashcardCard[]>(`/api/flashcards/decks/${deckId}/game`);
  },
};

export default flashcardService;
