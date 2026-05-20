import { create } from "zustand";
import { getRecentTransactionsWithMeta } from "../database/queries/transactions";
import { TransactionWithMeta } from "../types";

interface TransactionStore {
  recentTransactions: TransactionWithMeta[];
  loadRecentTransactions: (userId: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  recentTransactions: [],

  loadRecentTransactions: (userId: string) => {
    const recentTransactions = getRecentTransactionsWithMeta(userId, 5);
    set({ recentTransactions });
  },
}));