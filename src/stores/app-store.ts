import { create } from "zustand";

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
  openAddExpense: (ctx?: { groupId?: string; friendId?: string }) => void;
  closeAddExpense: () => void;
  openSettleUp: (ctx?: { groupId?: string; friendId?: string; friendName?: string }) => void;
  closeSettleUp: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  friends: [],
  groups: [],
  initData: null,
  isAddExpenseOpen: false,
  isSettleUpOpen: false,
  addExpenseContext: {},
  settleUpContext: {},

  setFriends: (friends) => set({ friends }),
  setGroups: (groups) => set({ groups }),
  setInitData: (data) => set({ initData: data }),
  openAddExpense: (ctx = {}) =>
    set({ isAddExpenseOpen: true, addExpenseContext: ctx }),
  closeAddExpense: () =>
    set({ isAddExpenseOpen: false, addExpenseContext: {} }),
  openSettleUp: (ctx = {}) =>
    set({ isSettleUpOpen: true, settleUpContext: ctx }),
  closeSettleUp: () =>
    set({ isSettleUpOpen: false, settleUpContext: {} }),
}));
