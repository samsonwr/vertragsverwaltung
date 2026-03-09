// ==================== Enums ====================

export type Vertragsart = 'wartung' | 'leasing';
export type Vertragsstatus = 'entwurf' | 'in_verhandlung' | 'aktiv' | 'gekuendigt' | 'abgelaufen';
export type Kategorie = 'hardware' | 'software' | 'cloud_service' | 'sonstige';
export type Waehrung = 'EUR' | 'USD' | 'CHF' | 'GBP';

export type EreignisTyp =
  | 'kuendigungsfrist'
  | 'laufzeitende'
  | 'verlaengerung'
  | 'preisanpassung'
  | 'review'
  | 'ende_testphase'
  | 'sonstige';

export type EreignisStatus = 'offen' | 'erledigt' | 'ignoriert';
export type Rolle = 'admin' | 'owner' | 'viewer';

// ==================== Core Models ====================

export interface Vertrag {
  id: string;
  vertragsnummer: string;
  titel: string;
  beschreibung: string;
  vertragsart: Vertragsart;
  status: Vertragsstatus;
  kategorie: Kategorie;

  // Geschäftspartner
  lieferant_nummer: string;
  lieferant_name: string;
  lieferant_ort: string;
  lieferant_land: string;
  ansprechpartner: string;
  verantwortlicher: string;
  kostenstelle: string;
  innenauftrag: string;

  // Laufzeiten
  vertragsbeginn: string;    // ISO date
  vertragsende: string;      // ISO date
  auto_verlaengerung: boolean;
  verlaengerung_monate: number;
  kuendigungsfrist_monate: number;
  vertragsvolumen: number;
  jaehrliche_kosten: number;
  waehrung: Waehrung;

  // IT-Bezug
  equipment_nummer: string;
  anlagen_nummer: string;

  // Dokumente
  dokument_referenz: string;
  dokument_version: string;

  // Meta
  erstellt_am: string;
  geaendert_am: string;
  erstellt_von: string;
}

export interface Ereignis {
  id: string;
  vertrag_id: string;
  typ: EreignisTyp;
  bezeichnung: string;
  datum: string;           // ISO date
  vorlauf_tage: number;    // Erinnerung X Tage vorher
  empfaenger: string;
  status: EreignisStatus;
  notizen: string;
  erstellt_am: string;
  geaendert_am: string;
}

export interface HistorieEintrag {
  id: string;
  vertrag_id: string;
  ereignis_id: string | null;
  aktion: string;
  feld: string;
  alter_wert: string;
  neuer_wert: string;
  benutzer: string;
  zeitpunkt: string;
}

export interface Benutzer {
  id: string;
  name: string;
  email: string;
  rolle: Rolle;
}

// ==================== API Types ====================

export interface VertragMitEreignisse extends Vertrag {
  ereignisse: Ereignis[];
  naechstes_ereignis?: Ereignis;
}

export interface DashboardStats {
  aktive_vertraege: number;
  wartungsvertraege: number;
  leasingvertraege: number;
  handlungsbedarf: number;
  jaehrliche_kosten_gesamt: number;
  kosten_nach_lieferant: { lieferant: string; summe: number }[];
  kosten_nach_kostenstelle: { kostenstelle: string; summe: number }[];
  vertraege_nach_status: { status: Vertragsstatus; anzahl: number }[];
}

export interface VertragFilter {
  vertragsart?: Vertragsart;
  status?: Vertragsstatus;
  kategorie?: Kategorie;
  lieferant?: string;
  verantwortlicher?: string;
  ablauf_monate?: number;  // Verträge die in X Monaten ablaufen
  suche?: string;
}
