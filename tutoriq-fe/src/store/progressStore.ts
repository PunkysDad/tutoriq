import { create } from 'zustand';
import { ProgressDashboard } from '../interfaces/interfaces';
import progressService from '../services/progressService';

interface ProgressState {
  dashboard: ProgressDashboard | null;
  isLoading: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
  clearDashboard: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  dashboard: null,
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await progressService.getDashboard();
      if (result.success) {
        set({ dashboard: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load dashboard', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load dashboard', isLoading: false });
    }
  },

  clearDashboard: () => set({ dashboard: null }),
}));
