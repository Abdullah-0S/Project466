import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'project.db');

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Create tasks table with INTEGER duration
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      startDate TEXT NOT NULL,
      finishDate TEXT NOT NULL
    )
  `);

  // Migrate old TEXT duration to INTEGER if needed
  try {
    const columns = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
    const hasDurationText = columns.some(col => col.name === 'duration');
    if (hasDurationText) {
      db.prepare(`UPDATE tasks SET duration = CAST(duration AS INTEGER) WHERE typeof(duration) = 'text'`).run();
    }
  } catch (e) {
    // Ignore migration errors
  }

  return db;
}

export interface Task {
  id?: number;
  name: string;
  duration: number;
  startDate: string;
  finishDate: string;
}

// Task operations
export function getTasks(): Task[] {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM tasks ORDER BY id');
  return stmt.all() as Task[];
}

export function getTask(id: number): Task | undefined {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id) as Task | undefined;
}

export function createTask(task: Task): number {
  const database = getDatabase();
  const stmt = database.prepare(
    'INSERT INTO tasks (name, duration, startDate, finishDate) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(task.name, task.duration, task.startDate, task.finishDate);
  return result.lastInsertRowid as number;
}

export function updateTask(id: number, task: Task): void {
  const database = getDatabase();
  const stmt = database.prepare(
    'UPDATE tasks SET name = ?, duration = ?, startDate = ?, finishDate = ? WHERE id = ?'
  );
  stmt.run(task.name, task.duration, task.startDate, task.finishDate, id);
}

export function deleteTask(id: number): void {
  const database = getDatabase();
  database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

// Renumber tasks after deletion so Task IDs stay 1..N (matches PDF sample)
export function renumberTasks(): void {
  const database = getDatabase();
  const tasks = database.prepare('SELECT * FROM tasks ORDER BY id').all() as Task[];
  tasks.forEach((task, index) => {
    const newId = index + 1;
    if (task.id !== newId) {
      database.prepare('UPDATE tasks SET id = ? WHERE id = ?').run(newId, task.id);
    }
  });
  // Keep AUTOINCREMENT seed aligned with the actual max id so the next POST gets max+1.
  // sqlite_sequence.name has no UNIQUE constraint, so INSERT OR REPLACE would duplicate —
  // delete the row(s) and SQLite re-creates one on the next INSERT starting at max(id)+1.
  database.prepare("DELETE FROM sqlite_sequence WHERE name = 'tasks'").run();
}
