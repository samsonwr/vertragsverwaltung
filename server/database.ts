import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'vertragsverwaltung.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS benutzer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      rolle TEXT NOT NULL DEFAULT 'viewer'
    );

    CREATE TABLE IF NOT EXISTS vertrag (
      id TEXT PRIMARY KEY,
      vertragsnummer TEXT NOT NULL UNIQUE,
      titel TEXT NOT NULL,
      beschreibung TEXT DEFAULT '',
      vertragsart TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'entwurf',
      kategorie TEXT NOT NULL DEFAULT 'sonstige',

      lieferant_nummer TEXT DEFAULT '',
      lieferant_name TEXT DEFAULT '',
      lieferant_ort TEXT DEFAULT '',
      lieferant_land TEXT DEFAULT 'DE',
      ansprechpartner TEXT DEFAULT '',
      verantwortlicher TEXT DEFAULT '',
      kostenstelle TEXT DEFAULT '',
      innenauftrag TEXT DEFAULT '',

      vertragsbeginn TEXT NOT NULL,
      vertragsende TEXT NOT NULL,
      auto_verlaengerung INTEGER DEFAULT 0,
      verlaengerung_monate INTEGER DEFAULT 12,
      kuendigungsfrist_monate INTEGER DEFAULT 3,
      vertragsvolumen REAL DEFAULT 0,
      jaehrliche_kosten REAL DEFAULT 0,
      waehrung TEXT DEFAULT 'EUR',

      equipment_nummer TEXT DEFAULT '',
      anlagen_nummer TEXT DEFAULT '',

      dokument_referenz TEXT DEFAULT '',
      dokument_version TEXT DEFAULT '1.0',

      erstellt_am TEXT NOT NULL,
      geaendert_am TEXT NOT NULL,
      erstellt_von TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS ereignis (
      id TEXT PRIMARY KEY,
      vertrag_id TEXT NOT NULL,
      typ TEXT NOT NULL,
      bezeichnung TEXT NOT NULL,
      datum TEXT NOT NULL,
      vorlauf_tage INTEGER DEFAULT 30,
      empfaenger TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'offen',
      notizen TEXT DEFAULT '',
      erstellt_am TEXT NOT NULL,
      geaendert_am TEXT NOT NULL,
      FOREIGN KEY (vertrag_id) REFERENCES vertrag(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS historie (
      id TEXT PRIMARY KEY,
      vertrag_id TEXT NOT NULL,
      ereignis_id TEXT,
      aktion TEXT NOT NULL,
      feld TEXT DEFAULT '',
      alter_wert TEXT DEFAULT '',
      neuer_wert TEXT DEFAULT '',
      benutzer TEXT NOT NULL,
      zeitpunkt TEXT NOT NULL,
      FOREIGN KEY (vertrag_id) REFERENCES vertrag(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vertrag_status ON vertrag(status);
    CREATE INDEX IF NOT EXISTS idx_vertrag_art ON vertrag(vertragsart);
    CREATE INDEX IF NOT EXISTS idx_vertrag_verantwortlicher ON vertrag(verantwortlicher);
    CREATE INDEX IF NOT EXISTS idx_ereignis_vertrag ON ereignis(vertrag_id);
    CREATE INDEX IF NOT EXISTS idx_ereignis_datum ON ereignis(datum);
    CREATE INDEX IF NOT EXISTS idx_ereignis_status ON ereignis(status);
    CREATE INDEX IF NOT EXISTS idx_historie_vertrag ON historie(vertrag_id);
  `);
}
