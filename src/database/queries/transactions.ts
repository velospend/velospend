import { getDatabase } from "../db";
import { Transaction } from "../../types";
import uuid from "react-native-uuid";
import { updateAccountBalance } from "./accounts";

export const createTransaction = (
  data: Omit<Transaction, "id" | "createdAt">
): Transaction => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO transactions
     (id, user_id, type, account_id, to_account_id, category_id, planner_id,
      amount, date_time, note, description, is_archived, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      id, data.userId, data.type, data.accountId,
      data.toAccountId ?? null, data.categoryId,
      data.plannerId ?? null, data.amount, data.dateTime,
      data.note ?? null, data.description ?? null, createdAt,
    ]
  );

  // update account balance automatically
  if (data.type === "expense" || data.type === "investment") {
    updateAccountBalance(data.accountId, data.amount, "subtract");
  } else if (data.type === "income") {
    updateAccountBalance(data.accountId, data.amount, "add");
  } else if (data.type === "self_transfer" && data.toAccountId) {
    updateAccountBalance(data.accountId, data.amount, "subtract");
    updateAccountBalance(data.toAccountId, data.amount, "add");
  }

  return { ...data, id, createdAt };
};

export const getTransactionsByUser = (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Transaction[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM transactions 
     WHERE user_id = ? AND is_archived = 0
     ORDER BY date_time DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows.map(mapTransaction);
};

export const getRecentTransactions = (
  userId: string,
  limit: number = 5
): Transaction[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM transactions
     WHERE user_id = ? AND is_archived = 0
     ORDER BY date_time DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map(mapTransaction);
};

export const getTransactionsByPlanner = (
  plannerId: string,
  categoryId: string
): Transaction[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM transactions
     WHERE planner_id = ? AND category_id = ? AND is_archived = 0
     ORDER BY date_time DESC`,
    [plannerId, categoryId]
  );
  return rows.map(mapTransaction);
};

export const deleteTransaction = (id: string): void => {
  const db = getDatabase();
  db.runSync(`DELETE FROM transactions WHERE id = ?`, [id]);
};

export const archiveOldTransactions = (userId: string): void => {
  const db = getDatabase();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  db.runSync(
    `UPDATE transactions SET is_archived = 1
     WHERE user_id = ? AND date_time < ? AND is_archived = 0`,
    [userId, sixMonthsAgo.toISOString()]
  );
};

const mapTransaction = (row: any): Transaction => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  accountId: row.account_id,
  toAccountId: row.to_account_id ?? undefined,
  categoryId: row.category_id,
  plannerId: row.planner_id ?? undefined,
  amount: row.amount,
  dateTime: row.date_time,
  note: row.note ?? undefined,
  description: row.description ?? undefined,
  isArchived: row.is_archived === 1,
  createdAt: row.created_at,
});

export const getPreviousNotes = (userId: string): string[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT DISTINCT note FROM transactions 
     WHERE user_id = ? AND note IS NOT NULL AND note != ''
     ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
  return rows.map((row) => row.note);
};

export const getFilteredTransactions = (
  userId: string,
  filters: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }
): Transaction[] => {
  const db = getDatabase();

  let query = `SELECT * FROM transactions WHERE user_id = ? AND is_archived = 0`;
  const params: any[] = [userId];

  if (filters.type) {
    query += ` AND type = ?`;
    params.push(filters.type);
  }
  if (filters.accountId) {
    query += ` AND account_id = ?`;
    params.push(filters.accountId);
  }
  if (filters.categoryId) {
    query += ` AND category_id = ?`;
    params.push(filters.categoryId);
  }
  if (filters.startDate) {
    query += ` AND date_time >= ?`;
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND date_time <= ?`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY date_time DESC`;

  const rows = db.getAllSync<any>(query, params);
  return rows.map(mapTransaction);
};

export const getTransactionById = (id: string): Transaction | null => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM transactions WHERE id = ?`,
    [id]
  );
  if (!row) return null;
  return mapTransaction(row);
};

export const updateTransaction = (
  id: string,
  data: Partial<Omit<Transaction, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE transactions SET
      type = ?, account_id = ?, to_account_id = ?, category_id = ?,
      planner_id = ?, amount = ?, date_time = ?, note = ?,
      description = ?
     WHERE id = ?`,
    [
      data.type ?? "expense",
      data.accountId ?? "",
      data.toAccountId ?? null,
      data.categoryId ?? "",
      data.plannerId ?? null,
      data.amount ?? 0,
      data.dateTime ?? new Date().toISOString(),
      data.note ?? null,
      data.description ?? null,
      id,
    ]
  );
};