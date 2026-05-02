import { getDatabase } from "../db";
import { Account } from "../../types";
import uuid from "react-native-uuid";

export const createAccount = (
  data: Omit<Account, "id" | "createdAt">
): Account => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO accounts 
     (id, user_id, name, type, total_amount, current_balance, currency, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.userId, data.name, data.type,
      data.totalAmount, data.currentBalance,
      data.currency, data.isActive ? 1 : 0, createdAt,
    ]
  );

  return { ...data, id, createdAt };
};

export const getAccountsByUser = (userId: string): Account[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM accounts WHERE user_id = ? AND is_active = 1 ORDER BY created_at ASC`,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    totalAmount: row.total_amount,
    currentBalance: row.current_balance,
    currency: row.currency,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  }));
};

export const updateAccount = (
  id: string,
  data: Partial<Omit<Account, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE accounts SET name = ?, type = ?, currency = ?, is_active = ? WHERE id = ?`,
    [
      data.name ?? "",
      data.type ?? "savings",
      data.currency ?? "INR",
      data.isActive ? 1 : 0,
      id,
    ]
  );
};

export const deleteAccount = (id: string): void => {
  const db = getDatabase();
  db.runSync(`UPDATE accounts SET is_active = 0 WHERE id = ?`, [id]);
};

export const updateAccountBalance = (
  id: string,
  amount: number,
  type: "add" | "subtract"
): void => {
  const db = getDatabase();
  const operator = type === "add" ? "+" : "-";
  db.runSync(
    `UPDATE accounts SET current_balance = current_balance ${operator} ? WHERE id = ?`,
    [amount, id]
  );
};