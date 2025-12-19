# Prompt-tree-app
A backend-driven application for managing and annotating a hierarchical prompt tree. The system exposes REST APIs to explore prompts, add sub-nodes, and store annotations with persistent storage using SQLite

# Objective
**Build a backend API that:**
- Represents prompts in a hierarchical tree structure
- Allows adding and organizing sub-nodes (subprompts) under prompts
- Supports annotations (notes) on both prompts and nodes
- Persists data reliably using a SQLite database
- Exposes a clean UI to explore and manage the prompt tree

# Tech Stack

**Backend**
- Node.js
- Express.js
- SQLite (better-sqlite3)
- Zod (request validation)
- Morgan (logging)
- CORS

**Frontend**
- React (Vite)
- JavaScript (ES6+)
- Fetch API
- CSS (custom styling)

# High-Level Architecture
- The backend owns the data model, validation, and persistence

**The frontend consumes backend APIs to:**
    - Render the prompt tree
    - Allow selection of prompts and subprompts
    - Edit and save notes
- All state is persisted in SQLite; the frontend remains stateless

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

**Tree & Fetching**
- GET /tree – Fetch the full prompt tree
- GET /prompts/:id – Fetch a single prompt
- GET /prompts/:id/nodes – Fetch nodes for a prompt

**Creation**
- POST /prompts – Create a new prompt
- POST /prompts/:id/nodes – Add a node to a prompt

**Updates**
- PATCH /prompts/:id/notes – Update prompt notes
- PATCH /nodes/:id/notes – Update node notes

# Environment Configuration
- The backend uses a .env file to configure the SQLite database path.

**Backend/.env**
    DB_PATH=specify your db path

**This ensures:**
- A single, consistent SQLite database is used
- No accidental creation of multiple data.sqlite files
- Predictable behavior across restarts


# Running the Project
**Backend Setup**
    cd Backend
    npm install
    npm run dev
Server runs at:
    http://localhost:4000

**Frontend Setup**
    cd frontend
    npm install
    npm run dev
Server runs at:
    http://localhost:5173

# Data Initialization

- Database and tables are created automatically on startup
- Initial data is seeded from prompt_list.json
- Seeding runs only if the database is empty
- SQLite uses WAL mode for reliable concurrent reads/writes

# Project Structure

    Prompt-tree-app/
    ├── Backend/
    │   ├── src/
    │   │   ├── db.js
    │   │   ├── server.js
    │   │   └── validation.js
    │   ├── data.sqlite
    │   ├── data.sqlite-wal
    │   ├── data.sqlite-shm
    │   ├── prompt_list.json
    │   ├── .env
    │   └── package.json
    │
    ├── Frontend/
    │   ├── src/
    │   │   ├── api/
    │   │   ├── components/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── index.html
    │   ├── vite.config.js
    │   └── package.json
    │
    └── README.md


# Key Design Decisions
- Backend is the single source of truth
- Notes act as documentation, verification, and annotations for each step
- Node IDs are auto-generated to avoid collisions and ensure consistency
- Frontend does not duplicate backend business logic
- Clear separation of concerns between data, API, and UI


