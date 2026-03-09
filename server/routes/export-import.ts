import { Router } from 'express';
import { getDb } from '../database.js';

export const exportImportRouter = Router();

// GET /api/export - Export entire database as JSON
exportImportRouter.get('/export', (_req, res) => {
  const db = getDb();

  const benutzer = db.prepare('SELECT * FROM benutzer').all();
  const vertraege = db.prepare('SELECT * FROM vertrag').all();
  const ereignisse = db.prepare('SELECT * FROM ereignis').all();
  const historie = db.prepare('SELECT * FROM historie').all();

  const data = {
    version: 1,
    exportiert_am: new Date().toISOString(),
    benutzer,
    vertraege,
    ereignisse,
    historie,
  };

  const dateStr = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Disposition', `attachment; filename=vertragsverwaltung-export-${dateStr}.json`);
  res.json(data);
});

// POST /api/import - Import database from JSON
exportImportRouter.post('/import', (req, res) => {
  const db = getDb();
  const data = req.body;

  if (!data || !data.version || !Array.isArray(data.vertraege)) {
    return res.status(400).json({ error: 'Ungültiges Import-Format. Erwartet: JSON mit version, vertraege, ereignisse, historie.' });
  }

  const stats = { benutzer: { eingefuegt: 0, uebersprungen: 0 }, vertraege: { eingefuegt: 0, uebersprungen: 0 }, ereignisse: { eingefuegt: 0, uebersprungen: 0 }, historie: { eingefuegt: 0, uebersprungen: 0 } };

  const insertOrIgnore = (table: string, rows: any[], statKey: keyof typeof stats) => {
    if (!Array.isArray(rows)) return;
    for (const row of rows) {
      const keys = Object.keys(row);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT OR IGNORE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = db.prepare(sql).run(...keys.map(k => row[k]));
      if (result.changes > 0) {
        stats[statKey].eingefuegt++;
      } else {
        stats[statKey].uebersprungen++;
      }
    }
  };

  try {
    db.transaction(() => {
      insertOrIgnore('benutzer', data.benutzer || [], 'benutzer');
      insertOrIgnore('vertrag', data.vertraege, 'vertraege');
      insertOrIgnore('ereignis', data.ereignisse || [], 'ereignisse');
      insertOrIgnore('historie', data.historie || [], 'historie');
    })();

    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: `Import fehlgeschlagen: ${err.message}` });
  }
});
