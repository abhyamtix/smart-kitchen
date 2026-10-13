const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database("smartkitchen.db");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    unit TEXT,
    expiry_date TEXT
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ingredients TEXT,
    instructions TEXT
  );
`);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Smart Kitchen Backend is running!"
  });
});

// Get all ingredients
app.get("/ingredients", (req, res) => {
  const ingredients = db
    .prepare("SELECT * FROM ingredients ORDER BY id DESC")
    .all();

  res.json(ingredients);
});

// Add an ingredient
app.post("/ingredients", (req, res) => {
  const { name, quantity, unit, expiry_date } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Ingredient name is required"
    });
  }

  const result = db
    .prepare(`
      INSERT INTO ingredients
      (name, quantity, unit, expiry_date)
      VALUES (?, ?, ?, ?)
    `)
    .run(
      name,
      quantity || 0,
      unit || "",
      expiry_date || ""
    );

  res.json({
    message: "Ingredient added successfully",
    id: result.lastInsertRowid
  });
});

// Delete an ingredient
app.delete("/ingredients/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM ingredients WHERE id = ?")
    .run(req.params.id);

  res.json({
    message: "Ingredient deleted",
    deleted: result.changes
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Smart Kitchen Backend running on http://localhost:${PORT}`);
});