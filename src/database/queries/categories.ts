import { getDatabase } from "../db";
import { Category } from "../../types";
import uuid from "react-native-uuid";

export const createCategory = (
  data: Omit<Category, "id" | "createdAt">
): Category => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO categories (id, user_id, name, icon, color, type, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.name, data.icon, data.color, data.type, data.isDefault ? 1 : 0, createdAt]
  );

  return { ...data, id, createdAt };
};

export const getCategoriesByUser = (
  userId: string,
  type?: "expense" | "income" | "investment"
): Category[] => {
  const db = getDatabase();
  const rows = type
    ? db.getAllSync<any>(
        `SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY is_default DESC, name ASC`,
        [userId, type]
      )
    : db.getAllSync<any>(
        `SELECT * FROM categories WHERE user_id = ? ORDER BY is_default DESC, name ASC`,
        [userId]
      );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
  }));
};

export const updateCategory = (
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?`,
    [data.name ?? "", data.icon ?? "", data.color ?? "", id]
  );
};

export const deleteCategory = (id: string): void => {
  const db = getDatabase();
  db.runSync(`DELETE FROM categories WHERE id = ? AND is_default = 0`, [id]);
};