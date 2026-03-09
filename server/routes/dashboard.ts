import { Router } from 'express';
import { getDb } from '../database';

export const dashboardRouter = Router();

// GET /api/dashboard/stats
dashboardRouter.get('/stats', (_req, res) => {
  const db = getDb();

  const aktive = (db.prepare("SELECT COUNT(*) as cnt FROM vertrag WHERE status = 'aktiv'").get() as any).cnt;
  const wartung = (db.prepare("SELECT COUNT(*) as cnt FROM vertrag WHERE vertragsart = 'wartung' AND status = 'aktiv'").get() as any).cnt;
  const leasing = (db.prepare("SELECT COUNT(*) as cnt FROM vertrag WHERE vertragsart = 'leasing' AND status = 'aktiv'").get() as any).cnt;

  const today = new Date().toISOString().split('T')[0];
  const in90Days = new Date();
  in90Days.setDate(in90Days.getDate() + 90);
  const in90Str = in90Days.toISOString().split('T')[0];

  const handlungsbedarf = (db.prepare(`
    SELECT COUNT(DISTINCT e.vertrag_id) as cnt
    FROM ereignis e
    JOIN vertrag v ON e.vertrag_id = v.id
    WHERE e.status = 'offen' AND e.datum <= ? AND e.datum >= ?
      AND v.status IN ('aktiv', 'in_verhandlung')
  `).get(in90Str, today) as any).cnt;

  const kostenGesamt = (db.prepare("SELECT COALESCE(SUM(jaehrliche_kosten), 0) as summe FROM vertrag WHERE status = 'aktiv'").get() as any).summe;

  const kostenNachLieferant = db.prepare(`
    SELECT lieferant_name as lieferant, SUM(jaehrliche_kosten) as summe
    FROM vertrag WHERE status = 'aktiv' AND lieferant_name != ''
    GROUP BY lieferant_name ORDER BY summe DESC
  `).all();

  const kostenNachKostenstelle = db.prepare(`
    SELECT kostenstelle, SUM(jaehrliche_kosten) as summe
    FROM vertrag WHERE status = 'aktiv' AND kostenstelle != ''
    GROUP BY kostenstelle ORDER BY summe DESC
  `).all();

  const nachStatus = db.prepare(`
    SELECT status, COUNT(*) as anzahl FROM vertrag GROUP BY status
  `).all();

  res.json({
    aktive_vertraege: aktive,
    wartungsvertraege: wartung,
    leasingvertraege: leasing,
    handlungsbedarf,
    jaehrliche_kosten_gesamt: kostenGesamt,
    kosten_nach_lieferant: kostenNachLieferant,
    kosten_nach_kostenstelle: kostenNachKostenstelle,
    vertraege_nach_status: nachStatus,
  });
});
