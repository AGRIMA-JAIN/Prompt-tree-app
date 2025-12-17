# Prompt-tree-app
A backend-driven application for managing and annotating a hierarchical prompt tree. The system exposes REST APIs to explore prompts, add sub-nodes, and store annotations with persistent storage using SQLite

# Objective
- Build a backend API that:
- Represents prompts in a tree structure
- Allows adding nodes to prompts
- Supports annotations on prompts and nodes
- Persists data reliably using a database

# Tech Stack

**Backend**
- Node.js
- Express.js
- SQLite (better-sqlite3)
- Zod (request validation)
- Morgan (logging)
- CORS

# Database Schema

**prompts**
- id (primary key)
- title
- description
- notes
- parent_id
- created_at

**nodes**
- id (auto-increment)
- prompt_id (foreign key)
- name
- action
- notes
- created_at

# API Endpoints

- GET /tree – Fetch the full prompt tree
- GET /prompts/:id – Fetch a single prompt
- GET /prompts/:id/nodes – Fetch nodes for a prompt
- POST /prompts – Create a new prompt
- POST /prompts/:id/nodes – Add a node to a prompt
- PATCH /prompts/:id/notes – Update prompt notes
- PATCH /nodes/:id/notes – Update node notes

# Running the Backend
    cd Backend
    npm install
    npm run dev
Server runs at:
    http://localhost:4000

# Data Initialization

- Database and tables are created automatically on startup
- Initial data is seeded from prompt_list.json
- Seeding runs only if the database is empty

