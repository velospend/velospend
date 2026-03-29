import { create } from "zustand";
import { User, Account } from "../types";
import { getFirstUser } from "../database/queries/users";
import { getAccountsByUser } from "../database/queries/accounts";

interface UserStore {
  user: User | null;
  accounts: Account[];
  loadUser: () => void;
  loadAccounts: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  accounts: [],

  loadUser: () => {
    const user = getFirstUser();
    set({ user });
    if (user) get().loadAccounts();
  },

  loadAccounts: () => {
    const user = get().user;
    if (!user) return;
    const accounts = getAccountsByUser(user.id);
    set({ accounts });
  },
}));