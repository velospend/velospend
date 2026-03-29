import { getDatabase } from "../db";
import { User } from "../../types";
import uuid from "react-native-uuid";
import { seedDefaultCategories } from "../schema";

export const createUser = (
  data: Omit<User, "id" | "createdAt">
): User => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO users (id, name, email, dob, city, country, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.email, data.dob, data.city, data.country, createdAt]
  );

  seedDefaultCategories(id);

  return { ...data, id, createdAt };
};

export const getUser = (id: string): User | null => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM users WHERE id = ?`, [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    dob: row.dob,
    city: row.city,
    country: row.country,
    createdAt: row.created_at,
  };
};

export const getFirstUser = (): User | null => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(`SELECT * FROM users LIMIT 1`);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    dob: row.dob,
    city: row.city,
    country: row.country,
    createdAt: row.created_at,
  };
};

export const updateUser = (
  id: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE users SET name = ?, email = ?, dob = ?, city = ?, country = ?
     WHERE id = ?`,
    [
      data.name ?? "",
      data.email ?? "",
      data.dob ?? "",
      data.city ?? "",
      data.country ?? "",
      id,
    ]
  );
};