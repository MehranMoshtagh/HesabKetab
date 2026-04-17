import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  friendshipId: string;
}

interface GroupSummary {
  id: string;
  name: string;
  type: string;
  memberCount: number;
}

interface InitData {
  balances: unknown;
  charts: unknown;
}

interface AppState {
  friends: Friend[];
  groups: GroupSummary[];
  initData: InitData | null;
  lastFetchedAt: number | null;
  isAddExpenseOpen: boolean;
  isSettleUpOpen: boolean;
  addExpenseContext: {
    groupId?: string;
    friendId?: string;
  };
  settleUpContext: {
    groupId?: string;
    friendId?: string;
    friendName?: string;
  };

  setFriends: (friends: Friend[]) => void;
  setGroups: (groups: GroupSummary[]) => void;
  setInitData: (data: InitData) => void;
  setLastFetchedAt: (ts: number) => void;
  openAddExpense: (ctx?: { groupId?: string; friendId?: string }) => void;
  closeAddExpense: () => void;
  openSettleUp: (ctx?: { groupId?: string; friendId?: string; friendName?: string }) => void;
  closeSettleUp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      friends: [],
      groups: [],
      initData: null,
      lastFetchedAt: null,
      isAddExpenseOpen: false,
      isSettleUpOpen: false,
      addExpenseContext: {},
      settleUpContext: {},

      setFriends: (friends) => set({ friends }),
      setGroups: (groups) => set({ groups }),
      setInitData: (data) => set({ initData: data }),
      setLastFetchedAt: (ts) => set({ lastFetchedAt: ts }),
      openAddExpense: (ctx = {}) =>
        set({ isAddExpenseOpen: true, addExpenseContext: ctx }),
      closeAddExpense: () =>
        set({ isAddExpenseOpen: false, addExpenseContext: {} }),
      openSettleUp: (ctx = {}) =>
        set({ isSettleUpOpen: true, settleUpContext: ctx }),
      closeSettleUp: () =>
        set({ isSettleUpOpen: false, settleUpContext: {} }),
    }),
    {
      name: "hesabketab-app-cache",
      storage: createJSONStorage(() => localStorage),
      // Only persist data, not ephemeral UI state
      partialize: (state) => ({
        friends: state.friends,
        groups: state.groups,
        initData: state.initData,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
