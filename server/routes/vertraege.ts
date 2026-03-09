import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database';
import type { Vertrag, VertragFilter } from '../../shared/types';

export const vertraegeRouter = Router();

// GET /api/vertraege - Liste mit Filtern
vertraegeRouter.get('/', (req, res) => {
  const db = getDb();
  const filter = req.query as VertragFilter;

  let sql = `
    SELECT v.*,
      (SELECT json_group_array(json_object(
        'id', e.id, 'vertrag_id', e.vertrag_id, 'typ', e.typ,
        'bezeichnung', e.bezeichnung, 'datum', e.datum,
        'vorlauf_tage', e.vorlauf_tage, 'empfaenger', e.empfaenger,
        'status', e.status, 'notizen', e.notizen,
        'erstellt_am', e.erstellt_am, 'geaendert_am', e.geaendert_am
      )) FROM ereignis e WHERE e.vertrag_id = v.id AND e.status = 'offen' ORDER BY e.datum ASC) as ereignisse_json
    FROM vertrag v WHERE 1=1
  `;
  const params: any[] = [];

  if (filter.vertragsart) {
    sql += ' AND v.vertragsart = ?';
    params.push(filter.vertragsart);
  }
  if (filter.status) {
    sql += ' AND v.status = ?';
    params.push(filter.status);
  }
  if (filter.kategorie) {
    sql += ' AND v.kategorie = ?';
    params.push(filter.kategorie);
  }
  if (filter.lieferant) {
    sql += ' AND (v.lieferant_name LIKE ? OR v.lieferant_nummer LIKE ?)';
    params.push(`%${filter.lieferant}%`, `%${filter.lieferant}%`);
  }
  if (filter.verantwortlicher) {
    sql += ' AND v.verantwortlicher = ?';
    params.push(filter.verantwortlicher);
  }
  if (filter.ablauf_monate) {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + Number(filter.ablauf_monate));
    sql += ' AND v.vertragsende <= ? AND v.vertragsende >= date("now")';
    params.push(futureDate.toISOString().split('T')[0]);
  }
  if (filter.suche) {
    sql += ' AND (v.titel LIKE ? OR v.beschreibung LIKE ? OR v.vertragsnummer LIKE ? OR v.lieferant_name LIKE ?)';
    const s = `%${filter.suche}%`;
    params.push(s, s, s, s);
  }

  sql += ' ORDER BY v.geaendert_am DESC';

  const rows = db.prepare(sql).all(...params) as any[];

  const result = rows.map(row => {
    let ereignisse = [];
    try {
      ereignisse = row.ereignisse_json ? JSON.parse(row.ereignisse_json) : [];
      if (ereignisse.length === 1 && ereignisse[0].id === null) ereignisse = [];
    } catch { ereignisse = []; }

    const naechstes = ereignisse
      .filter((e: any) => e.datum >= new Date().toISOString().split('T')[0])
      .sort((a: any, b: any) => a.datum.localeCompare(b.datum))[0] || null;

    const { ereignisse_json, ...vertrag } = row;
    return {
      ...vertrag,
      auto_verlaengerung: Boolean(vertrag.auto_verlaengerung),
      ereignisse,
      naechstes_ereignis: naechstes,
    };
  });

  res.json(result);
});

// GET /api/vertraege/:id
vertraegeRouter.get('/:id', (req, res) => {
  const db = getDb();
  const vertrag = db.prepare('SELECT * FROM vertrag WHERE id = ?').get(req.params.id) as any;
  if (!vertrag) return res.status(404).json({ error: 'Vertrag nicht gefunden' });

  const ereignisse = db.prepare(
    'SELECT * FROM ereignis WHERE vertrag_id = ? ORDER BY datum ASC'
  ).all(req.params.id);

  res.json({
    ...vertrag,
    auto_verlaengerung: Boolean(vertrag.auto_verlaengerung),
    ereignisse,
  });
});

// POST /api/vertraege
vertraegeRouter.post('/', (req, res) => {
  const db = getDb();
  const id = uuid();
  const now = new Date().toISOString();
  const v: Partial<Vertrag> = req.body;

  // Generate contract number
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM vertrag').get() as any).cnt;
  const vertragsnummer = v.vertragsnummer || `VTR-${String(count + 1).padStart(5, '0')}`;

  const stmt = db.prepare(`
    INSERT INTO vertrag (
      id, vertragsnummer, titel, beschreibung, vertragsart, status, kategorie,
      lieferant_nummer, lieferant_name, lieferant_ort, lieferant_land,
      ansprechpartner, verantwortlicher, kostenstelle, innenauftrag,
      vertragsbeginn, vertragsende, auto_verlaengerung, verlaengerung_monate,
      kuendigungsfrist_monate, vertragsvolumen, jaehrliche_kosten, waehrung,
      equipment_nummer, anlagen_nummer, dokument_referenz, dokument_version,
      erstellt_am, geaendert_am, erstellt_von
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  stmt.run(
    id, vertragsnummer, v.titel || '', v.beschreibung || '', v.vertragsart || 'wartung',
    v.status || 'entwurf', v.kategorie || 'sonstige',
    v.lieferant_nummer || '', v.lieferant_name || '', v.lieferant_ort || '', v.lieferant_land || 'DE',
    v.ansprechpartner || '', v.verantwortlicher || '', v.kostenstelle || '', v.innenauftrag || '',
    v.vertragsbeginn || now.split('T')[0], v.vertragsende || '', v.auto_verlaengerung ? 1 : 0,
    v.verlaengerung_monate || 12, v.kuendigungsfrist_monate || 3,
    v.vertragsvolumen || 0, v.jaehrliche_kosten || 0, v.waehrung || 'EUR',
    v.equipment_nummer || '', v.anlagen_nummer || '', v.dokument_referenz || '', v.dokument_version || '1.0',
    now, now, v.erstellt_von || 'system'
  );

  // Auto-create events: Kündigungsfrist + Laufzeitende
  if (v.vertragsende) {
    const endeDate = new Date(v.vertragsende);

    // Laufzeitende
    const ereignisEnde = uuid();
    db.prepare(`
      INSERT INTO ereignis (id, vertrag_id, typ, bezeichnung, datum, vorlauf_tage, empfaenger, status, notizen, erstellt_am, geaendert_am)
      VALUES (?, ?, 'laufzeitende', 'Laufzeitende', ?, 30, ?, 'offen', '', ?, ?)
    `).run(ereignisEnde, id, v.vertragsende, v.verantwortlicher || '', now, now);

    // Kündigungsfrist
    const kuendigungMonths = v.kuendigungsfrist_monate || 3;
    const kuendigungDate = new Date(endeDate);
    kuendigungDate.setMonth(kuendigungDate.getMonth() - kuendigungMonths);
    const kuendigungDateStr = kuendigungDate.toISOString().split('T')[0];

    const ereignisKuendigung = uuid();
    db.prepare(`
      INSERT INTO ereignis (id, vertrag_id, typ, bezeichnung, datum, vorlauf_tage, empfaenger, status, notizen, erstellt_am, geaendert_am)
      VALUES (?, ?, 'kuendigungsfrist', 'Kündigungsfrist', ?, 30, ?, 'offen', '', ?, ?)
    `).run(ereignisKuendigung, id, kuendigungDateStr, v.verantwortlicher || '', now, now);
  }

  // Historie
  db.prepare(`
    INSERT INTO historie (id, vertrag_id, ereignis_id, aktion, feld, alter_wert, neuer_wert, benutzer, zeitpunkt)
    VALUES (?, ?, NULL, 'erstellt', '', '', ?, ?, ?)
  `).run(uuid(), id, `Vertrag ${vertragsnummer} angelegt`, v.erstellt_von || 'system', now);

  const created = db.prepare('SELECT * FROM vertrag WHERE id = ?').get(id);
  res.status(201).json(created);
});

// PUT /api/vertraege/:id
vertraegeRouter.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM vertrag WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Vertrag nicht gefunden' });

  const now = new Date().toISOString();
  const v: Partial<Vertrag> = req.body;

  // Track changes for history
  const trackFields = [
    'titel', 'beschreibung', 'vertragsart', 'status', 'kategorie',
    'lieferant_nummer', 'lieferant_name', 'verantwortlicher', 'kostenstelle',
    'vertragsbeginn', 'vertragsende', 'auto_verlaengerung', 'kuendigungsfrist_monate',
    'vertragsvolumen', 'jaehrliche_kosten',
  ];

  const changes: { feld: string; alt: string; neu: string }[] = [];
  for (const f of trackFields) {
    const oldVal = String(existing[f] ?? '');
    const newVal = String((v as any)[f] ?? existing[f] ?? '');
    if (oldVal !== newVal && (v as any)[f] !== undefined) {
      changes.push({ feld: f, alt: oldVal, neu: newVal });
    }
  }

  db.prepare(`
    UPDATE vertrag SET
      titel = ?, beschreibung = ?, vertragsart = ?, status = ?, kategorie = ?,
      lieferant_nummer = ?, lieferant_name = ?, lieferant_ort = ?, lieferant_land = ?,
      ansprechpartner = ?, verantwortlicher = ?, kostenstelle = ?, innenauftrag = ?,
      vertragsbeginn = ?, vertragsende = ?, auto_verlaengerung = ?, verlaengerung_monate = ?,
      kuendigungsfrist_monate = ?, vertragsvolumen = ?, jaehrliche_kosten = ?, waehrung = ?,
      equipment_nummer = ?, anlagen_nummer = ?, dokument_referenz = ?, dokument_version = ?,
      geaendert_am = ?
    WHERE id = ?
  `).run(
    v.titel ?? existing.titel, v.beschreibung ?? existing.beschreibung,
    v.vertragsart ?? existing.vertragsart, v.status ?? existing.status,
    v.kategorie ?? existing.kategorie,
    v.lieferant_nummer ?? existing.lieferant_nummer, v.lieferant_name ?? existing.lieferant_name,
    v.lieferant_ort ?? existing.lieferant_ort, v.lieferant_land ?? existing.lieferant_land,
    v.ansprechpartner ?? existing.ansprechpartner, v.verantwortlicher ?? existing.verantwortlicher,
    v.kostenstelle ?? existing.kostenstelle, v.innenauftrag ?? existing.innenauftrag,
    v.vertragsbeginn ?? existing.vertragsbeginn, v.vertragsende ?? existing.vertragsende,
    v.auto_verlaengerung !== undefined ? (v.auto_verlaengerung ? 1 : 0) : existing.auto_verlaengerung,
    v.verlaengerung_monate ?? existing.verlaengerung_monate,
    v.kuendigungsfrist_monate ?? existing.kuendigungsfrist_monate,
    v.vertragsvolumen ?? existing.vertragsvolumen,
    v.jaehrliche_kosten ?? existing.jaehrliche_kosten, v.waehrung ?? existing.waehrung,
    v.equipment_nummer ?? existing.equipment_nummer, v.anlagen_nummer ?? existing.anlagen_nummer,
    v.dokument_referenz ?? existing.dokument_referenz, v.dokument_version ?? existing.dokument_version,
    now, req.params.id
  );

  // Write history entries
  for (const change of changes) {
    db.prepare(`
      INSERT INTO historie (id, vertrag_id, ereignis_id, aktion, feld, alter_wert, neuer_wert, benutzer, zeitpunkt)
      VALUES (?, ?, NULL, 'geaendert', ?, ?, ?, ?, ?)
    `).run(uuid(), req.params.id, change.feld, change.alt, change.neu, v.erstellt_von || 'system', now);
  }

  // If Kündigungsfrist changed, update the event
  if (v.kuendigungsfrist_monate !== undefined && v.kuendigungsfrist_monate !== existing.kuendigungsfrist_monate) {
    const ende = v.vertragsende || existing.vertragsende;
    if (ende) {
      const endeDate = new Date(ende);
      endeDate.setMonth(endeDate.getMonth() - v.kuendigungsfrist_monate);
      const newDateStr = endeDate.toISOString().split('T')[0];
      db.prepare(`
        UPDATE ereignis SET datum = ?, geaendert_am = ?
        WHERE vertrag_id = ? AND typ = 'kuendigungsfrist' AND status = 'offen'
      `).run(newDateStr, now, req.params.id);
    }
  }

  const updated = db.prepare('SELECT * FROM vertrag WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/vertraege/:id
vertraegeRouter.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM vertrag WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Vertrag nicht gefunden' });

  db.prepare('DELETE FROM vertrag WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
