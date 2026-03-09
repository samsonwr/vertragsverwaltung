import { getDb } from './database.js';
import { v4 as uuid } from 'uuid';

const db = getDb();

// Benutzer
const adminId = uuid();
const ownerId = uuid();
const viewerId = uuid();

db.prepare("INSERT OR IGNORE INTO benutzer (id, name, email, rolle) VALUES (?, 'Max Mustermann', 'max.mustermann@mkn.de', 'admin')").run(adminId);
db.prepare("INSERT OR IGNORE INTO benutzer (id, name, email, rolle) VALUES (?, 'Anna Schmidt', 'anna.schmidt@mkn.de', 'owner')").run(ownerId);
db.prepare("INSERT OR IGNORE INTO benutzer (id, name, email, rolle) VALUES (?, 'Peter Viewer', 'peter.viewer@mkn.de', 'viewer')").run(viewerId);

const now = new Date().toISOString();

const vertraege = [
  {
    id: uuid(), vertragsnummer: 'VTR-00001', titel: 'SAP HANA Wartungsvertrag',
    beschreibung: 'Jährlicher Wartungsvertrag für SAP HANA Datenbank inkl. Updates und Support',
    vertragsart: 'wartung', status: 'aktiv', kategorie: 'software',
    lieferant_nummer: '100001', lieferant_name: 'SAP SE', lieferant_ort: 'Walldorf', lieferant_land: 'DE',
    ansprechpartner: 'Herr Müller', verantwortlicher: 'Max Mustermann',
    kostenstelle: 'KST-IT-001', innenauftrag: 'IA-2024-001',
    vertragsbeginn: '2024-01-01', vertragsende: '2026-12-31',
    auto_verlaengerung: 1, verlaengerung_monate: 12, kuendigungsfrist_monate: 6,
    vertragsvolumen: 150000, jaehrliche_kosten: 50000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00002', titel: 'Microsoft 365 Enterprise',
    beschreibung: 'Microsoft 365 E5 Lizenzen für 200 Benutzer',
    vertragsart: 'wartung', status: 'aktiv', kategorie: 'cloud_service',
    lieferant_nummer: '100002', lieferant_name: 'Microsoft Deutschland GmbH', lieferant_ort: 'München', lieferant_land: 'DE',
    ansprechpartner: 'Frau Weber', verantwortlicher: 'Anna Schmidt',
    kostenstelle: 'KST-IT-002', innenauftrag: 'IA-2024-002',
    vertragsbeginn: '2024-04-01', vertragsende: '2026-03-31',
    auto_verlaengerung: 1, verlaengerung_monate: 12, kuendigungsfrist_monate: 3,
    vertragsvolumen: 288000, jaehrliche_kosten: 96000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00003', titel: 'Notebook-Leasing Dell Latitude',
    beschreibung: 'Leasing von 50 Dell Latitude 5540 Notebooks',
    vertragsart: 'leasing', status: 'aktiv', kategorie: 'hardware',
    lieferant_nummer: '100003', lieferant_name: 'Dell Technologies GmbH', lieferant_ort: 'Frankfurt', lieferant_land: 'DE',
    ansprechpartner: 'Herr Fischer', verantwortlicher: 'Max Mustermann',
    kostenstelle: 'KST-IT-003', innenauftrag: 'IA-2024-003',
    vertragsbeginn: '2024-06-01', vertragsende: '2027-05-31',
    auto_verlaengerung: 0, verlaengerung_monate: 0, kuendigungsfrist_monate: 3,
    vertragsvolumen: 75000, jaehrliche_kosten: 25000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00004', titel: 'Server-Leasing HPE ProLiant',
    beschreibung: 'Leasing von 5 HPE ProLiant DL380 Gen10 Servern',
    vertragsart: 'leasing', status: 'aktiv', kategorie: 'hardware',
    lieferant_nummer: '100004', lieferant_name: 'HPE Deutschland GmbH', lieferant_ort: 'Böblingen', lieferant_land: 'DE',
    ansprechpartner: 'Herr Braun', verantwortlicher: 'Max Mustermann',
    kostenstelle: 'KST-IT-001', innenauftrag: 'IA-2023-010',
    vertragsbeginn: '2023-01-01', vertragsende: '2026-06-30',
    auto_verlaengerung: 0, verlaengerung_monate: 0, kuendigungsfrist_monate: 3,
    vertragsvolumen: 120000, jaehrliche_kosten: 40000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00005', titel: 'Firewall Wartung Palo Alto',
    beschreibung: 'Wartungs- und Supportvertrag für Palo Alto Firewalls PA-5250',
    vertragsart: 'wartung', status: 'aktiv', kategorie: 'hardware',
    lieferant_nummer: '100005', lieferant_name: 'Palo Alto Networks', lieferant_ort: 'München', lieferant_land: 'DE',
    ansprechpartner: 'Frau Lang', verantwortlicher: 'Anna Schmidt',
    kostenstelle: 'KST-IT-SEC', innenauftrag: 'IA-2024-005',
    vertragsbeginn: '2024-03-01', vertragsende: '2026-02-28',
    auto_verlaengerung: 1, verlaengerung_monate: 12, kuendigungsfrist_monate: 3,
    vertragsvolumen: 36000, jaehrliche_kosten: 18000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00006', titel: 'Drucker-Leasing Konica Minolta',
    beschreibung: 'Leasing von 10 Konica Minolta bizhub C360i Multifunktionsdruckern',
    vertragsart: 'leasing', status: 'aktiv', kategorie: 'hardware',
    lieferant_nummer: '100006', lieferant_name: 'Konica Minolta Business Solutions', lieferant_ort: 'Hannover', lieferant_land: 'DE',
    ansprechpartner: 'Herr Klein', verantwortlicher: 'Anna Schmidt',
    kostenstelle: 'KST-ALLG', innenauftrag: 'IA-2024-006',
    vertragsbeginn: '2024-02-01', vertragsende: '2027-01-31',
    auto_verlaengerung: 0, verlaengerung_monate: 0, kuendigungsfrist_monate: 6,
    vertragsvolumen: 54000, jaehrliche_kosten: 18000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00007', titel: 'AWS Cloud Services',
    beschreibung: 'Enterprise Support und Reserved Instances',
    vertragsart: 'wartung', status: 'in_verhandlung', kategorie: 'cloud_service',
    lieferant_nummer: '100007', lieferant_name: 'Amazon Web Services EMEA SARL', lieferant_ort: 'Luxemburg', lieferant_land: 'LU',
    ansprechpartner: 'Herr Thompson', verantwortlicher: 'Max Mustermann',
    kostenstelle: 'KST-IT-001', innenauftrag: '',
    vertragsbeginn: '2026-07-01', vertragsende: '2029-06-30',
    auto_verlaengerung: 1, verlaengerung_monate: 12, kuendigungsfrist_monate: 3,
    vertragsvolumen: 360000, jaehrliche_kosten: 120000, waehrung: 'EUR',
  },
  {
    id: uuid(), vertragsnummer: 'VTR-00008', titel: 'Altes Monitoring Tool',
    beschreibung: 'Nagios Enterprise Wartungsvertrag - wurde durch neue Lösung ersetzt',
    vertragsart: 'wartung', status: 'gekuendigt', kategorie: 'software',
    lieferant_nummer: '100008', lieferant_name: 'Nagios Enterprises LLC', lieferant_ort: 'Saint Paul', lieferant_land: 'US',
    ansprechpartner: '', verantwortlicher: 'Max Mustermann',
    kostenstelle: 'KST-IT-001', innenauftrag: 'IA-2022-020',
    vertragsbeginn: '2022-01-01', vertragsende: '2025-12-31',
    auto_verlaengerung: 0, verlaengerung_monate: 0, kuendigungsfrist_monate: 3,
    vertragsvolumen: 15000, jaehrliche_kosten: 5000, waehrung: 'EUR',
  },
];

const insertVertrag = db.prepare(`
  INSERT INTO vertrag (
    id, vertragsnummer, titel, beschreibung, vertragsart, status, kategorie,
    lieferant_nummer, lieferant_name, lieferant_ort, lieferant_land,
    ansprechpartner, verantwortlicher, kostenstelle, innenauftrag,
    vertragsbeginn, vertragsende, auto_verlaengerung, verlaengerung_monate,
    kuendigungsfrist_monate, vertragsvolumen, jaehrliche_kosten, waehrung,
    equipment_nummer, anlagen_nummer, dokument_referenz, dokument_version,
    erstellt_am, geaendert_am, erstellt_von
  ) VALUES (
    @id, @vertragsnummer, @titel, @beschreibung, @vertragsart, @status, @kategorie,
    @lieferant_nummer, @lieferant_name, @lieferant_ort, @lieferant_land,
    @ansprechpartner, @verantwortlicher, @kostenstelle, @innenauftrag,
    @vertragsbeginn, @vertragsende, @auto_verlaengerung, @verlaengerung_monate,
    @kuendigungsfrist_monate, @vertragsvolumen, @jaehrliche_kosten, @waehrung,
    '', '', '', '1.0',
    @now, @now, 'seed'
  )
`);

const insertEreignis = db.prepare(`
  INSERT INTO ereignis (id, vertrag_id, typ, bezeichnung, datum, vorlauf_tage, empfaenger, status, notizen, erstellt_am, geaendert_am)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'offen', '', ?, ?)
`);

for (const v of vertraege) {
  insertVertrag.run({ ...v, now });

  // Laufzeitende
  insertEreignis.run(uuid(), v.id, 'laufzeitende', 'Laufzeitende', v.vertragsende, 30, v.verantwortlicher, now, now);

  // Kündigungsfrist (subtractMonths clamped to last day of month)
  const endeDate = new Date(v.vertragsende);
  const targetMonth = endeDate.getMonth() - v.kuendigungsfrist_monate;
  const kuendigungDate = new Date(endeDate);
  kuendigungDate.setMonth(targetMonth);
  if (kuendigungDate.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    kuendigungDate.setDate(0);
  }
  insertEreignis.run(uuid(), v.id, 'kuendigungsfrist', 'Kündigungsfrist', kuendigungDate.toISOString().split('T')[0], 30, v.verantwortlicher, now, now);

  // Review for some contracts
  if (v.status === 'aktiv') {
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + Math.floor(Math.random() * 3) + 1);
    insertEreignis.run(uuid(), v.id, 'review', 'Jährliches Review', reviewDate.toISOString().split('T')[0], 14, v.verantwortlicher, now, now);
  }
}

console.log(`Seed abgeschlossen: ${vertraege.length} Verträge, 3 Benutzer erstellt.`);
