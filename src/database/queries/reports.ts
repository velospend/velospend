import { getDatabase } from "../db";

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  savings: number;
}

export interface DailyData {
  day: number;
  income: number;
  expense: number;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  percentage: number;
}

export const getReportSummary = (
  userId: string,
  startDate: string,
  endDate: string
): ReportSummary => {
  const db = getDatabase();

  const income = db.getFirstSync<any>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = ? AND type = 'income' AND is_archived = 0
     AND date_time >= ? AND date_time <= ?`,
    [userId, startDate, endDate]
  );

  const expense = db.getFirstSync<any>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = ? AND type = 'expense' AND is_archived = 0
     AND date_time >= ? AND date_time <= ?`,
    [userId, startDate, endDate]
  );

  const investment = db.getFirstSync<any>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = ? AND type = 'investment' AND is_archived = 0
     AND date_time >= ? AND date_time <= ?`,
    [userId, startDate, endDate]
  );

  const totalIncome = income?.total ?? 0;
  const totalExpense = expense?.total ?? 0;
  const totalInvestment = investment?.total ?? 0;
  const savings = totalIncome - totalExpense - totalInvestment;

  return { totalIncome, totalExpense, totalInvestment, savings };
};

export const getMonthlySummary = (
  userId: string,
  startDate: string,
  endDate: string
): MonthlySummary[] => {
  const db = getDatabase();

  const rows = db.getAllSync<any>(
    `SELECT 
      strftime('%Y-%m', date_time) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE user_id = ? AND is_archived = 0
     AND date_time >= ? AND date_time <= ?
     GROUP BY strftime('%Y-%m', date_time)
     ORDER BY month ASC`,
    [userId, startDate, endDate]
  );

  return rows.map((row) => ({
    month: row.month,
    income: row.income ?? 0,
    expense: row.expense ?? 0,
  }));
};

export const getCategorySummary = (
  userId: string,
  startDate: string,
  endDate: string,
  type: "expense" | "income"
): CategorySummary[] => {
  const db = getDatabase();

  const rows = db.getAllSync<any>(
    `SELECT 
      t.category_id,
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon,
      SUM(t.amount) as total
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.type = ? AND t.is_archived = 0
     AND t.date_time >= ? AND t.date_time <= ?
     AND t.category_id IS NOT NULL
     GROUP BY t.category_id
     ORDER BY total DESC`,
    [userId, type, startDate, endDate]
  );

  const grandTotal = rows.reduce((sum: number, row: any) => sum + row.total, 0);

  return rows.map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name || "Unknown",
    categoryColor: row.category_color || "#95A5A6",
    categoryIcon: row.category_icon || "tag",
    total: row.total,
    percentage: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0,
  }));
};

export const getDateRange = (period: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  let startDate = new Date(now);

  switch (period) {
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "3_months":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6_months":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
};

export const getDailyData = (
  userId: string,
  startDate: string,
  endDate: string
): DailyData[] => {
  const db = getDatabase();

  const rows = db.getAllSync<any>(
    `SELECT 
      CAST(strftime('%d', date_time) AS INTEGER) as day,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions
     WHERE user_id = ? AND is_archived = 0
     AND date_time >= ? AND date_time <= ?
     GROUP BY strftime('%d', date_time)
     ORDER BY day ASC`,
    [userId, startDate, endDate]
  );

  return rows.map((row) => ({
    day: row.day,
    income: row.income ?? 0,
    expense: row.expense ?? 0,
  }));
};

export const getAccountBalances = (userId: string): AccountBalance[] => {
  const db = getDatabase();

  const rows = db.getAllSync<any>(
    `SELECT id, name, type, current_balance FROM accounts
     WHERE user_id = ? AND is_active = 1
     ORDER BY current_balance DESC`,
    [userId]
  );

  const total = rows.reduce((sum: number, row: any) => sum + row.current_balance, 0);

  return rows.map((row) => ({
    accountId: row.id,
    accountName: row.name,
    accountType: row.type,
    balance: row.current_balance,
    percentage: total > 0 ? (row.current_balance / total) * 100 : 0,
  }));
};

export const getAccountSpending = (
  userId: string,
  startDate: string,
  endDate: string
): AccountBalance[] => {
  const db = getDatabase();

  const rows = db.getAllSync<any>(
    `SELECT 
      a.id as accountId,
      a.name as accountName,
      a.type as accountType,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as balance
     FROM accounts a
     LEFT JOIN transactions t ON a.id = t.account_id
       AND t.is_archived = 0
       AND t.date_time >= ?
       AND t.date_time <= ?
     WHERE a.user_id = ? AND a.is_active = 1
     GROUP BY a.id
     ORDER BY balance DESC`,
    [startDate, endDate, userId]
  );

  const total = rows.reduce((sum: number, row: any) => sum + row.balance, 0);

  return rows
    .filter((row) => row.balance > 0)
    .map((row) => ({
      accountId: row.accountId,
      accountName: row.accountName,
      accountType: row.accountType,
      balance: row.balance,
      percentage: total > 0 ? (row.balance / total) * 100 : 0,
    }));
};