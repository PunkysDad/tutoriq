import { create } from 'zustand';
import { TutorSession, TutorMessage } from '../interfaces/interfaces';
import tutorService from '../services/tutorService';
import { TrialLimitError } from '../services/apiService';

interface TutorState {
  sessions: TutorSession[];
  activeSession: TutorSession | null;
  messages: TutorMessage[];
  isLoadingResponse: boolean;
  isSendingMessage: boolean;
  error: string | null;
  trialLimitHit: boolean;

  startNewSession: () => Promise<TutorSession>;
  loadSession: (sessionId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearActiveSession: () => void;
  setError: (msg: string | null) => void;
  clearTrialLimit: () => void;
}

export const useTutorStore = create<TutorState>((set, get) => ({
  sessions: [],
  activeSession: null,
  messages: [],
  isLoadingResponse: false,
  isSendingMessage: false,
  error: null,
  trialLimitHit: false,

  startNewSession: async () => {
    set({ error: null });
    const result = await tutorService.createSession();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create session');
    }
    set({ activeSession: result.data, messages: [] });
    return result.data;
  },

  loadSession: async (sessionId: number) => {
    set({ error: null });
    const result = await tutorService.getSession(sessionId);
    if (result.success) {
      set({
        activeSession: result.data,
        messages: result.data.messages ?? [],
      });
    } else {
      set({ error: result.error || 'Failed to load session' });
    }
  },

  sendMessage: async (content: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const optimisticMsg: TutorMessage = {
      id: Date.now(),
      sessionId: activeSession.id,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMsg],
      isSendingMessage: true,
      isLoadingResponse: true,
      error: null,
      trialLimitHit: false,
    }));

    try {
      const result = await tutorService.sendMessage(activeSession.id, content);
      if (result.success) {
        set((state) => ({
          messages: [...state.messages, result.data],
          isLoadingResponse: false,
          isSendingMessage: false,
        }));
      } else {
        set({ error: result.error || 'Failed to send message', isLoadingResponse: false, isSendingMessage: false });
      }
    } catch (err: any) {
      if (err instanceof TrialLimitError) {
        set({ trialLimitHit: true, isLoadingResponse: false, isSendingMessage: false });
      } else {
        set({
          error: err.message || 'Failed to send message',
          isLoadingResponse: false,
          isSendingMessage: false,
        });
      }
    }
  },

  clearActiveSession: () => {
    set({ activeSession: null, messages: [], error: null, trialLimitHit: false });
  },

  setError: (msg: string | null) => set({ error: msg }),

  clearTrialLimit: () => set({ trialLimitHit: false }),
}));
