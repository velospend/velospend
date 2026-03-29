import { getDatabase } from "./db";
import { DEFAULT_CATEGORIES } from "../constants";
import uuid from "react-native-uuid";

export const createTables = (): void => {
  const db = getDatabase();

  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // ─── Users ───────────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      dob         TEXT NOT NULL,
      city        TEXT NOT NULL,
      country     TEXT NOT NULL,
      created_at  TEXT NOT NULL
    );
  `);

  // ─── Accounts ─────────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id               TEXT PRIMARY KEY NOT NULL,
      user_id          TEXT NOT NULL,
      name             TEXT NOT NULL,
      type             TEXT NOT NULL,
      total_amount     REAL NOT NULL DEFAULT 0,
      current_balance  REAL NOT NULL DEFAULT 0,
      currency         TEXT NOT NULL DEFAULT 'INR',
      is_active        INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // ─── Categories ───────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY NOT NULL,
      user_id     TEXT NOT NULL,
      name        TEXT NOT NULL,
      icon        TEXT NOT NULL,
      color       TEXT NOT NULL,
      type        TEXT NOT NULL,
      is_default  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // ─── Transactions ─────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id              TEXT PRIMARY KEY NOT NULL,
      user_id         TEXT NOT NULL,
      type            TEXT NOT NULL,
      account_id      TEXT NOT NULL,
      to_account_id   TEXT,
      category_id     TEXT NOT NULL,
      planner_id      TEXT,
      amount          REAL NOT NULL,
      date_time       TEXT NOT NULL,
      note            TEXT,
      description     TEXT,
      is_archived     INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL,
      FOREIGN KEY (user_id)       REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (account_id)    REFERENCES accounts (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id)   REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (planner_id)    REFERENCES planners (id) ON DELETE SET NULL
    );
  `);

  // ─── Planners ─────────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS planners (
      id              TEXT PRIMARY KEY NOT NULL,
      user_id         TEXT NOT NULL,
      title           TEXT NOT NULL,
      type            TEXT NOT NULL,
      total_planned   REAL NOT NULL DEFAULT 0,
      start_date      TEXT NOT NULL,
      end_date        TEXT NOT NULL,
      created_at      TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // ─── Planner Records ──────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS planner_records (
      id              TEXT PRIMARY KEY NOT NULL,
      planner_id      TEXT NOT NULL,
      category_id     TEXT NOT NULL,
      planned_amount  REAL NOT NULL DEFAULT 0,
      note            TEXT,
      description     TEXT,
      created_at      TEXT NOT NULL,
      FOREIGN KEY (planner_id)  REFERENCES planners (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

  // ─── Investments ──────────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS investments (
      id                 TEXT PRIMARY KEY NOT NULL,
      user_id            TEXT NOT NULL,
      investment_name    TEXT NOT NULL,
      type               TEXT NOT NULL,
      total_invested     REAL NOT NULL DEFAULT 0,
      current_value      REAL NOT NULL DEFAULT 0,
      recurring_type     TEXT NOT NULL,
      recurrence_period  TEXT,
      note               TEXT,
      created_at         TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // ─── Investment Transactions ──────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS investment_transactions (
      id            TEXT PRIMARY KEY NOT NULL,
      investment_id TEXT NOT NULL,
      amount        REAL NOT NULL,
      date_time     TEXT NOT NULL,
      account_name  TEXT NOT NULL,
      note          TEXT,
      description   TEXT,
      created_at    TEXT NOT NULL,
      FOREIGN KEY (investment_id) REFERENCES investments (id) ON DELETE CASCADE
    );
  `);

  // ─── Recurring Rules ──────────────────────────────────────────────────────
  db.execSync(`
    CREATE TABLE IF NOT EXISTS recurring_rules (
      id             TEXT PRIMARY KEY NOT NULL,
      user_id        TEXT NOT NULL,
      title          TEXT NOT NULL,
      amount         REAL NOT NULL,
      category_id    TEXT NOT NULL,
      account_id     TEXT NOT NULL,
      frequency      TEXT NOT NULL,
      next_due_date  TEXT NOT NULL,
      note           TEXT,
      description    TEXT,
      is_active      INTEGER NOT NULL DEFAULT 1,
      created_at     TEXT NOT NULL,
      FOREIGN KEY (user_id)     REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (account_id)  REFERENCES accounts (id) ON DELETE CASCADE
    );
  `);
};

// ─── Seed Default Categories ──────────────────────────────────────────────────

export const seedDefaultCategories = (userId: string): void => {
  const db = getDatabase();

  const existing = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM categories WHERE user_id = ? AND is_default = 1`,
    [userId]
  );

  if (existing && existing.count > 0) return; // already seeded

  const now = new Date().toISOString();

  DEFAULT_CATEGORIES.forEach((cat) => {
    db.runSync(
      `INSERT INTO categories (id, user_id, name, icon, color, type, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [uuid.v4() as string, userId, cat.name, cat.icon, cat.color, cat.type, now]
    );
  });
};