import { create } from 'zustand';
import { Tag } from '../interfaces/interfaces';
import tagService from '../services/tagService';

interface TagState {
  tags: Tag[];
  sessionTags: Record<number, Tag[]>;
  isLoading: boolean;
  error: string | null;

  loadTags: () => Promise<void>;
  createTag: (name: string) => Promise<void>;
  deleteTag: (tagId: number) => Promise<void>;
  loadSessionTags: (sessionId: number) => Promise<void>;
  assignTags: (sessionId: number, tagIds: number[]) => Promise<void>;
  removeTag: (sessionId: number, tagId: number) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  sessionTags: {},
  isLoading: false,
  error: null,

  loadTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await tagService.getTags();
      if (result.success) {
        set({ tags: result.data, isLoading: false });
      } else {
        set({ error: result.error || 'Failed to load tags', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load tags', isLoading: false });
    }
  },

  createTag: async (name: string) => {
    set({ error: null });
    try {
      const result = await tagService.createTag(name);
      if (result.success) {
        set((state) => ({ tags: [...state.tags, result.data] }));
      } else {
        set({ error: result.error || 'Failed to create tag' });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to create tag' });
    }
  },

  deleteTag: async (tagId: number) => {
    try {
      const result = await tagService.deleteTag(tagId);
      if (result.success) {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== tagId),
        }));
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete tag' });
    }
  },

  loadSessionTags: async (sessionId: number) => {
    try {
      const result = await tagService.getSessionTags(sessionId);
      if (result.success) {
        set((state) => ({
          sessionTags: { ...state.sessionTags, [sessionId]: result.data },
        }));
      }
    } catch {
      // silent
    }
  },

  assignTags: async (sessionId: number, tagIds: number[]) => {
    try {
      await tagService.assignTags(sessionId, tagIds);
      await get().loadSessionTags(sessionId);
    } catch (err: any) {
      set({ error: err.message || 'Failed to assign tags' });
    }
  },

  removeTag: async (sessionId: number, tagId: number) => {
    try {
      await tagService.removeTag(sessionId, tagId);
      await get().loadSessionTags(sessionId);
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove tag' });
    }
  },
}));
