import { getDatabase } from "../db";
import { Planner, PlannerRecord } from "../../types";
import uuid from "react-native-uuid";

export const createPlanner = (
  data: Omit<Planner, "id" | "createdAt">
): Planner => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO planners (id, user_id, title, type, total_planned, start_date, end_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.userId, data.title, data.type, data.totalPlanned, data.startDate, data.endDate, createdAt]
  );

  return { ...data, id, createdAt };
};

export const getPlannersByUser = (userId: string): Planner[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM planners WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    totalPlanned: row.total_planned,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  }));
};

export const deletePlanner = (id: string): void => {
  const db = getDatabase();
  db.runSync(`DELETE FROM planners WHERE id = ?`, [id]);
};

// ─── Planner Records ──────────────────────────────────────────────────────────

export const createPlannerRecord = (
  data: Omit<PlannerRecord, "id" | "createdAt">
): PlannerRecord => {
  const db = getDatabase();
  const id = uuid.v4() as string;
  const createdAt = new Date().toISOString();

  db.runSync(
    `INSERT INTO planner_records (id, planner_id, category_id, planned_amount, note, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.plannerId, data.categoryId, data.plannedAmount, data.note ?? null, data.description ?? null, createdAt]
  );

  return { ...data, id, createdAt };
};

export const getPlannerRecords = (plannerId: string): PlannerRecord[] => {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM planner_records WHERE planner_id = ? ORDER BY created_at ASC`,
    [plannerId]
  );
  return rows.map((row) => ({
    id: row.id,
    plannerId: row.planner_id,
    categoryId: row.category_id,
    plannedAmount: row.planned_amount,
    note: row.note ?? undefined,
    description: row.description ?? undefined,
    createdAt: row.created_at,
  }));
};

export const deletePlannerRecord = (id: string): void => {
  const db = getDatabase();
  db.runSync(`DELETE FROM planner_records WHERE id = ?`, [id]);
};

export const getPlannerById = (id: string): Planner | null => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM planners WHERE id = ?`, [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    totalPlanned: row.total_planned,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
};

export const updatePlanner = (
  id: string,
  data: Partial<Omit<Planner, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE planners SET title = ?, type = ?, total_planned = ?, start_date = ?, end_date = ? WHERE id = ?`,
    [
      data.title ?? "",
      data.type ?? "expense",
      data.totalPlanned ?? 0,
      data.startDate ?? "",
      data.endDate ?? "",
      id,
    ]
  );
};

export const getPlannerRecordById = (id: string): PlannerRecord | null => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM planner_records WHERE id = ?`, [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    plannerId: row.planner_id,
    categoryId: row.category_id,
    plannedAmount: row.planned_amount,
    note: row.note ?? undefined,
    description: row.description ?? undefined,
    createdAt: row.created_at,
  };
};

export const updatePlannerRecord = (
  id: string,
  data: Partial<Omit<PlannerRecord, "id" | "createdAt">>
): void => {
  const db = getDatabase();
  db.runSync(
    `UPDATE planner_records SET planned_amount = ?, note = ?, description = ? WHERE id = ?`,
    [
      data.plannedAmount ?? 0,
      data.note ?? null,
      data.description ?? null,
      id,
    ]
  );
};

export const getUsedAmountForRecord = (
  plannerId: string,
  categoryId: string
): number => {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE planner_id = ? AND category_id = ? AND is_archived = 0`,
    [plannerId, categoryId]
  );
  return row?.total ?? 0;
};