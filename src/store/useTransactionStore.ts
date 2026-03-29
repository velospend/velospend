import { create } from "zustand";
import { Transaction } from "../types";
import { getRecentTransactions } from "../database/queries/transactions";

interface TransactionStore {
  recentTransactions: Transaction[];
  loadRecentTransactions: (userId: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  recentTransactions: [],

  loadRecentTransactions: (userId: string) => {
    const recentTransactions = getRecentTransactions(userId, 5);
    set({ recentTransactions });
  },
}));