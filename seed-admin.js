const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const dbPath = './data/dev.db';
const db = new Database(dbPath);

const adminEmail = process.env.ADMIN_EMAIL || 'nedcaffarra@yahoo.com';
const id = uuidv4();
const now = Date.now();

try {
  const exists = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (exists) {
    console.log('Admin user already exists:', adminEmail);
  } else {
    db.prepare('INSERT INTO users (id, email, first_name, last_name, created_at, role) VALUES (?, ?, ?, ?, ?, ?)').run(id, adminEmail, 'Ned', 'Caffarra', now, 'ADMIN');
    console.log('Created admin user:', adminEmail);
  }
} catch (err) {
  console.error('Error seeding admin user', err);
} finally {
  db.close();
}
