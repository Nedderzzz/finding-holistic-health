import Database from "better-sqlite3";
import path from "path";

const dbPath = "./data/dev.db";
const dataDir = path.dirname(dbPath);

// Create data directory
const fs = await import("fs");
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create all tables
const schema = fs.readFileSync("./src/db/schema.sql", "utf-8");
sqlite.exec(schema);

console.log("Database initialized successfully!");
sqlite.close();
