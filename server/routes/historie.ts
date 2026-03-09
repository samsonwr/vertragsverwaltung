import { Router } from 'express';
import { getDb } from '../database.js';

export const historieRouter = Router();

// GET /api/historie?vertrag_id=...
historieRouter.get('/', (req, res) => {
  const db = getDb();
  let sql = 'SELECT * FROM historie WHERE 1=1';
  const params: any[] = [];

  if (req.query.vertrag_id) {
    sql += ' AND vertrag_id = ?';
    params.push(req.query.vertrag_id);
  }

  sql += ' ORDER BY zeitpunkt DESC';

  if (req.query.limit) {
    sql += ' LIMIT ?';
    params.push(Number(req.query.limit));
  }

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});
