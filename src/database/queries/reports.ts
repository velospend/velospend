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