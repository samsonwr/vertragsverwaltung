import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database.js';

export const benutzerRouter = Router();

// GET /api/benutzer
benutzerRouter.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM benutzer ORDER BY name').all();
  res.json(rows);
});

// GET /api/benutzer/aktuell - Simuliert den aktuellen User
benutzerRouter.get('/aktuell', (_req, res) => {
  const db = getDb();
  let user = db.prepare("SELECT * FROM benutzer WHERE rolle = 'admin' LIMIT 1").get();
  if (!user) {
    // Create default admin
    const id = uuid();
    db.prepare("INSERT INTO benutzer (id, name, email, rolle) VALUES (?, 'Admin', 'admin@mkn.de', 'admin')").run(id);
    user = db.prepare('SELECT * FROM benutzer WHERE id = ?').get(id);
  }
  res.json(user);
});

// POST /api/benutzer
benutzerRouter.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const { name, email, rolle } = req.body;
  db.prepare('INSERT INTO benutzer (id, name, email, rolle) VALUES (?, ?, ?, ?)').run(id, name, email, rolle || 'viewer');
  const created = db.prepare('SELECT * FROM benutzer WHERE id = ?').get(id);
  res.status(201).json(created);
});
