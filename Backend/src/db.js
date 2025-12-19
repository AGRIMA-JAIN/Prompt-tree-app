const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data.sqlite");


function openDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); 
  return db;
}


function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      parent_id INTEGER NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      action TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_nodes_prompt_id ON nodes(prompt_id);
  `);
}


function seedFromJsonIfEmpty(db, jsonPath) {
  // Check if DB already has prompts
  const row = db.prepare("SELECT COUNT(*) AS c FROM prompts").get();
  if (row.c > 0) return; // already seeded

  // Read and parse JSON
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  // Prepare SQL insert statements once (faster than building SQL every loop)
  const insertPrompt = db.prepare(`
    INSERT INTO prompts (id, title, description, notes, parent_id)
    VALUES (@id, @title, @description, '', NULL)
  `);

  const insertNode = db.prepare(`
    INSERT INTO nodes (prompt_id, name, action, notes)
    VALUES (@prompt_id, @name, @action, '')
  `);

  // Transaction ensures either ALL inserts succeed or NONE do
  const tx = db.transaction(() => {
    for (const p of data.prompts || []) {
      // Insert prompt
      insertPrompt.run({
        id: p.id,
        title: p.title ?? "",
        description: p.description ?? ""
      });

      // Insert nodes/subprompts belonging to this prompt
      for (const n of p.subprompts || []) {
        insertNode.run({
          prompt_id: p.id,
          name: n.name ?? "",
          action: n.action ?? ""
        });
      }
    }
  });

  tx();
}

module.exports = { openDb, migrate, seedFromJsonIfEmpty };
