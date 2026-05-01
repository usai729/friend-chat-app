import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,

      // Data
      friends: [],
      requests: [],
      conversations: [],

      // Actions
      login: (userData, token) => set({
        user: userData,
        token,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        friends: [],
        requests: [],
        conversations: [],
      }),

      setFriends: (friends) => set({ friends }),
      setRequests: (requests) => set({ requests }),
      setConversations: (conversations) => set({ conversations }),
    }),
    {
      name: 'friend-chat-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export default useStore;