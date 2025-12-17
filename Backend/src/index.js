const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("node:path");

const { openDb, migrate, seedFromJsonIfEmpty } = require("./db");
const {
  CreatePromptBody,
  UpdateNotesBody,
  CreateNodeBody,
  UpdateNodeNotesBody,
} = require("./validation");

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));


const db = openDb();
migrate(db);

const seedPath =
  process.env.SEED_JSON || path.join(__dirname, "..", "..", "prompt_list.json");
seedFromJsonIfEmpty(db, seedPath);


function promptRowToDto(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    notes: row.notes,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

function nodeRowToDto(row) {
  return {
    id: row.id,
    promptId: row.prompt_id,
    name: row.name,
    action: row.action,
    notes: row.notes,
    createdAt: row.created_at,
  };
}



//GET /tree

app.get("/tree", (_req, res) => {
  const prompts = db.prepare("SELECT * FROM prompts ORDER BY id ASC").all();
  const nodes = db.prepare("SELECT * FROM nodes ORDER BY id ASC").all();

  
  const nodesByPrompt = new Map();
  for (const node of nodes) {
    const list = nodesByPrompt.get(node.prompt_id) || [];
    list.push(nodeRowToDto(node));
    nodesByPrompt.set(node.prompt_id, list);
  }

  
  const promptById = new Map(
    prompts.map((p) => [
      p.id,
      {
        ...promptRowToDto(p),
        children: [],
        nodes: nodesByPrompt.get(p.id) || [],
      },
    ])
  );

 
  const roots = [];
  for (const prompt of promptById.values()) {
    if (prompt.parentId && promptById.has(prompt.parentId)) {
      promptById.get(prompt.parentId).children.push(prompt);
    } else {
      roots.push(prompt);
    }
  }

  res.json({ roots });
});


 //GET /prompts/:id
 
app.get("/prompts/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);

  if (!row) {
    return res.status(404).json({ error: "Prompt not found" });
  }

  res.json({ prompt: promptRowToDto(row) });
});


//GET /prompts/:id/nodes

app.get("/prompts/:id/nodes", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM prompts WHERE id = ?").get(id);

  if (!exists) {
    return res.status(404).json({ error: "Prompt not found" });
  }

  const rows = db
    .prepare("SELECT * FROM nodes WHERE prompt_id = ? ORDER BY id ASC")
    .all(id);

  res.json({ nodes: rows.map(nodeRowToDto) });
});


 //POST /prompts
 
app.post("/prompts", (req, res) => {
  const parsed = CreatePromptBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { id, title, description, parentId } = parsed.data;

  if (parentId != null) {
    const parent = db.prepare("SELECT id FROM prompts WHERE id = ?").get(parentId);
    if (!parent) {
      return res.status(400).json({ error: "parentId does not exist" });
    }
  }

  if (id != null) {
    db.prepare(
      "INSERT INTO prompts (id, title, description, parent_id) VALUES (?, ?, ?, ?)"
    ).run(id, title, description, parentId ?? null);

    return res.status(201).json({
      prompt: { id, title, description, notes: "", parentId: parentId ?? null },
    });
  }

  const result = db
    .prepare("INSERT INTO prompts (title, description, parent_id) VALUES (?, ?, ?)")
    .run(title, description, parentId ?? null);

  const created = db
    .prepare("SELECT * FROM prompts WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ prompt: promptRowToDto(created) });
});


 //POST /prompts/:id/nodes
 
app.post("/prompts/:id/nodes", (req, res) => {
  const promptId = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM prompts WHERE id = ?").get(promptId);

  if (!exists) {
    return res.status(404).json({ error: "Prompt not found" });
  }

  const parsed = CreateNodeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, action } = parsed.data;

  const result = db
    .prepare("INSERT INTO nodes (prompt_id, name, action) VALUES (?, ?, ?)")
    .run(promptId, name, action);

  const created = db
    .prepare("SELECT * FROM nodes WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ node: nodeRowToDto(created) });
});


 //PATCH /prompts/:id/notes
 
app.patch("/prompts/:id/notes", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM prompts WHERE id = ?").get(id);

  if (!exists) {
    return res.status(404).json({ error: "Prompt not found" });
  }

  const parsed = UpdateNotesBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  db.prepare("UPDATE prompts SET notes = ? WHERE id = ?")
    .run(parsed.data.notes, id);

  const updated = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  res.json({ prompt: promptRowToDto(updated) });
});


 //PATCH /nodes/:id/notes
 
app.patch("/nodes/:id/notes", (req, res) => {
  const id = Number(req.params.id);
  const exists = db.prepare("SELECT id FROM nodes WHERE id = ?").get(id);

  if (!exists) {
    return res.status(404).json({ error: "Node not found" });
  }

  const parsed = UpdateNodeNotesBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  db.prepare("UPDATE nodes SET notes = ? WHERE id = ?")
    .run(parsed.data.notes, id);

  const updated = db.prepare("SELECT * FROM nodes WHERE id = ?").get(id);
  res.json({ node: nodeRowToDto(updated) });
});


 //Health check

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});


// Start server
 
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
