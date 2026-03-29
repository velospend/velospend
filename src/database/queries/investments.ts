import { getDatabase } from "../db";
import { Investment, InvestmentTransaction } from "../../types";
import uuid from "react-native-uuid";

export const createInvestment = (
  data: Omit<Investment, "id" | "createdAt">
): Investment => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO investments
     (id, user_id, investment_name, type, total_invested, current_value, recurring_type, recurrence_period, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.userId, data.investmentName, data.type,
      data.totalInvested, data.currentValue, data.recurringType,
      data.recurrencePeriod ?? null, data.note ?? null, createdAt,
    ]
  );

  return { ...data, id, createdAt };
};

export const getInvestmentsByUser = (userId: string): Investment[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    investmentName: row.investment_name,
    type: row.type,
    totalInvested: row.total_invested,
    currentValue: row.current_value,
    recurringType: row.recurring_type,
    recurrencePeriod: row.recurrence_period ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }));
};

export const updateInvestmentValue = (
  id: string,
  currentValue: number
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE investments SET current_value = ? WHERE id = ?`,
    [currentValue, id]
  );
};

export const deleteInvestment = (id: string): void => {
  const db = getDatabase();
  db.runSync(`DELETE FROM investments WHERE id = ?`, [id]);
};

// ─── Investment Transactions ───────────────────────────────────────────────────

export const createInvestmentTransaction = (
  data: Omit<InvestmentTransaction, "id" | "createdAt">
): InvestmentTransaction => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO investment_transactions
     (id, investment_id, amount, date_time, account_name, note, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.investmentId, data.amount, data.dateTime,
      data.accountName, data.note ?? null, data.description ?? null, createdAt,
    ]
  );

  // update total invested on parent investment
  db.runSync(
    `UPDATE investments SET total_invested = total_invested + ? WHERE id = ?`,
    [data.amount, data.investmentId]
  );

  return { ...data, id, createdAt };
};

export const getInvestmentTransactions = (
  investmentId: string
): InvestmentTransaction[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM investment_transactions WHERE investment_id = ? ORDER BY date_time DESC`,
    [investmentId]
  );
  return rows.map((row) => ({
    id: row.id,
    investmentId: row.investment_id,
    amount: row.amount,
    dateTime: row.date_time,
    accountName: row.account_name,
    note: row.note ?? undefined,
    description: row.description ?? undefined,
    createdAt: row.created_at,
  }));
};