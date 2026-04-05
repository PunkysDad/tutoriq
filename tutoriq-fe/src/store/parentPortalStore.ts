import { create } from 'zustand';
import { ParentChildSummary, ChildDashboard, ChatHistoryEntry } from '../interfaces/interfaces';
import parentPortalService from '../services/parentPortalService';

interface ParentPortalState {
  children: ParentChildSummary[];
  activeChild: ChildDashboard | null;
  activeChildSessions: ChatHistoryEntry[];
  isLoading: boolean;
  isLinking: boolean;
  error: string | null;

  loadChildren: () => Promise<void>;
  loadChildDashboard: (childId: number) => Promise<void>;
  linkChild: (email: string) => Promise<void>;
  unlinkChild: (childId: number) => Promise<void>;
  clearActiveChild: () => void;
}

export const useParentPortalStore = create<ParentPortalState>((set) => ({
  children: [],
  activeChild: null,
  activeChildSessions: [],
  isLoading: false,
  isLinking: false,
  error: null,

  loadChildren: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await parentPortalService.getChildren();
      if (result.success) {
        set({ children: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load children', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadChildDashboard: async (childId: number) => {
    set({ isLoading: true, error: null });
    try {
      const [dashResult, sessionsResult] = await Promise.all([
        parentPortalService.getChildDashboard(childId),
        parentPortalService.getChildSessions(childId),
      ]);

      if (dashResult.success) {
        set({
          activeChild: dashResult.data,
          activeChildSessions: sessionsResult.success ? sessionsResult.data : [],
          isLoading: false,
        });
      } else {
        set({ error: dashResult.error || 'Failed to load dashboard', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  linkChild: async (email: string) => {
    set({ isLinking: true, error: null });
    try {
      const result = await parentPortalService.linkChild(email);
      if (result.success) {
        set({ isLinking: false });
        // Refresh children list
        const listResult = await parentPortalService.getChildren();
        if (listResult.success) set({ children: listResult.data });
      } else {
        throw new Error(result.error || 'Failed to link child');
      }
    } catch (err: any) {
      set({ error: err.message, isLinking: false });
      throw err;
    }
  },

  unlinkChild: async (childId: number) => {
    try {
      await parentPortalService.unlinkChild(childId);
      set((s) => ({ children: s.children.filter((c) => c.childId !== childId) }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearActiveChild: () => set({ activeChild: null, activeChildSessions: [] }),
}));
