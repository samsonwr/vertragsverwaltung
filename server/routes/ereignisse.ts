import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database.js';

export const ereignisseRouter = Router();

// GET /api/ereignisse?vertrag_id=...&status=...
ereignisseRouter.get('/', (req, res) => {
  const db = getDb();
  let sql = 'SELECT e.*, v.titel as vertrag_titel, v.vertragsnummer FROM ereignis e LEFT JOIN vertrag v ON e.vertrag_id = v.id WHERE 1=1';
  const params: any[] = [];

  if (req.query.vertrag_id) {
    sql += ' AND e.vertrag_id = ?';
    params.push(req.query.vertrag_id);
  }
  if (req.query.status) {
    sql += ' AND e.status = ?';
    params.push(req.query.status);
  }
  if (req.query.bis_datum) {
    sql += ' AND e.datum <= ?';
    params.push(req.query.bis_datum);
  }
  if (req.query.ab_datum) {
    sql += ' AND e.datum >= ?';
    params.push(req.query.ab_datum);
  }

  sql += ' ORDER BY e.datum ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/ereignisse/handlungsbedarf
ereignisseRouter.get('/handlungsbedarf', (_req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const in90Days = new Date();
  in90Days.setDate(in90Days.getDate() + 90);
  const in90Str = in90Days.toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT e.*, v.titel as vertrag_titel, v.vertragsnummer, v.lieferant_name, v.verantwortlicher, v.status as vertrag_status
    FROM ereignis e
    LEFT JOIN vertrag v ON e.vertrag_id = v.id
    WHERE e.status = 'offen'
      AND e.datum <= ?
      AND e.datum >= ?
      AND v.status IN ('aktiv', 'in_verhandlung')
    ORDER BY e.datum ASC
  `).all(in90Str, today);

  res.json(rows);
});

// POST /api/ereignisse
ereignisseRouter.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const now = new Date().toISOString();
  const e = req.body;

  db.prepare(`
    INSERT INTO ereignis (id, vertrag_id, typ, bezeichnung, datum, vorlauf_tage, empfaenger, status, notizen, erstellt_am, geaendert_am)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, e.vertrag_id, e.typ, e.bezeichnung, e.datum, e.vorlauf_tage || 30, e.empfaenger || '', e.status || 'offen', e.notizen || '', now, now);

  // Historie
  db.prepare(`
    INSERT INTO historie (id, vertrag_id, ereignis_id, aktion, feld, alter_wert, neuer_wert, benutzer, zeitpunkt)
    VALUES (?, ?, ?, 'ereignis_erstellt', '', '', ?, ?, ?)
  `).run(uuid(), e.vertrag_id, id, `${e.typ}: ${e.bezeichnung} am ${e.datum}`, e.benutzer || 'system', now);

  const created = db.prepare('SELECT * FROM ereignis WHERE id = ?').get(id);
  res.status(201).json(created);
});

// PUT /api/ereignisse/:id
ereignisseRouter.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM ereignis WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Ereignis nicht gefunden' });

  const now = new Date().toISOString();
  const e = req.body;

  db.prepare(`
    UPDATE ereignis SET
      typ = ?, bezeichnung = ?, datum = ?, vorlauf_tage = ?,
      empfaenger = ?, status = ?, notizen = ?, geaendert_am = ?
    WHERE id = ?
  `).run(
    e.typ ?? existing.typ, e.bezeichnung ?? existing.bezeichnung,
    e.datum ?? existing.datum, e.vorlauf_tage ?? existing.vorlauf_tage,
    e.empfaenger ?? existing.empfaenger, e.status ?? existing.status,
    e.notizen ?? existing.notizen, now, req.params.id
  );

  // Track changes
  const changes: string[] = [];
  if (e.datum && e.datum !== existing.datum) changes.push(`Datum: ${existing.datum} → ${e.datum}`);
  if (e.status && e.status !== existing.status) changes.push(`Status: ${existing.status} → ${e.status}`);
  if (e.bezeichnung && e.bezeichnung !== existing.bezeichnung) changes.push(`Bezeichnung geändert`);

  if (changes.length > 0) {
    db.prepare(`
      INSERT INTO historie (id, vertrag_id, ereignis_id, aktion, feld, alter_wert, neuer_wert, benutzer, zeitpunkt)
      VALUES (?, ?, ?, 'ereignis_geaendert', ?, ?, ?, ?, ?)
    `).run(uuid(), existing.vertrag_id, req.params.id, 'ereignis', '', changes.join('; '), e.benutzer || 'system', now);
  }

  const updated = db.prepare('SELECT * FROM ereignis WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/ereignisse/:id
ereignisseRouter.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM ereignis WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Ereignis nicht gefunden' });

  db.prepare('DELETE FROM ereignis WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
