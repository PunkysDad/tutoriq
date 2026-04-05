import { create } from 'zustand';
import { ChatHistoryEntry } from '../interfaces/interfaces';
import chatHistoryService from '../services/chatHistoryService';

interface ChatHistoryState {
  entries: ChatHistoryEntry[];
  isLoading: boolean;
  selectedSessionIds: number[];
  isMultiSelectMode: boolean;
  summaryResult: string | null;
  summaryCached: boolean;
  isSummarizing: boolean;
  error: string | null;

  loadHistory: () => Promise<void>;
  toggleMultiSelectMode: () => void;
  toggleSessionSelection: (sessionId: number) => void;
  generateSummary: () => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  clearSummary: () => void;
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  entries: [],
  isLoading: false,
  selectedSessionIds: [],
  isMultiSelectMode: false,
  summaryResult: null,
  summaryCached: false,
  isSummarizing: false,
  error: null,

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await chatHistoryService.getChatHistory();
      if (result.success) {
        set({ entries: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load history', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load history', isLoading: false });
    }
  },

  toggleMultiSelectMode: () => {
    set((state) => ({
      isMultiSelectMode: !state.isMultiSelectMode,
      selectedSessionIds: [],
    }));
  },

  toggleSessionSelection: (sessionId: number) => {
    set((state) => ({
      selectedSessionIds: state.selectedSessionIds.includes(sessionId)
        ? state.selectedSessionIds.filter((id) => id !== sessionId)
        : [...state.selectedSessionIds, sessionId],
    }));
  },

  generateSummary: async () => {
    const { selectedSessionIds } = get();
    if (selectedSessionIds.length === 0) return;

    set({ isSummarizing: true, error: null });
    try {
      const result = await chatHistoryService.generateSummary(selectedSessionIds);
      if (result.success) {
        set({
          summaryResult: result.data.summary,
          summaryCached: result.data.cached,
          isSummarizing: false,
        });
      } else {
        set({ error: result.error || 'Failed to generate summary', isSummarizing: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to generate summary', isSummarizing: false });
    }
  },

  deleteSession: async (sessionId: number) => {
    try {
      const result = await chatHistoryService.deleteSession(sessionId);
      if (result.success) {
        set((state) => ({
          entries: state.entries.filter((e) => e.sessionId !== sessionId),
          selectedSessionIds: state.selectedSessionIds.filter((id) => id !== sessionId),
        }));
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete session' });
    }
  },

  clearSummary: () => set({ summaryResult: null, summaryCached: false }),
}));
