# MKN Vertragsverwaltung

Moderne lokale Web-Applikation zur Verwaltung von IT-Wartungs- und Leasingverträgen.

## Features

- **Dashboard** – KPI-Kacheln, Kostenübersicht nach Lieferant/Kostenstelle, Statusverteilung
- **Vertragsliste** – Filterable Tabelle (Art, Status, Kategorie, Ablaufzeitraum, Freitextsuche), CSV-Export
- **Vertragsdetail** – Tabs für Stammdaten, Termine/Fristen, Änderungshistorie
- **Vertrag anlegen/bearbeiten** – Vollständiges Formular inkl. Lieferantendaten, Laufzeiten, Konditionen
- **Handlungsbedarf** – Übersicht aller offenen Termine in den nächsten 90 Tagen
- **Reporting** – Gruppierte Auswertungen mit Balkendiagrammen und CSV-Export
- **Automatische Fristen** – Kündigungsfrist- und Laufzeitende-Termine werden bei Vertragsanlage erzeugt
- **Änderungshistorie** – Protokolliert wer, wann, welches Feld geändert hat

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | React 18, TypeScript, Tailwind CSS, React Router, Lucide Icons |
| Backend | Express.js, TypeScript |
| Datenbank | SQLite (via better-sqlite3) |
| Build | Vite |

## Voraussetzungen

- Node.js >= 18

## Installation & Start

```bash
# Dependencies installieren
npm install

# Testdaten laden (optional, einmalig)
npm run db:seed

# Entwicklungsserver starten (Frontend + Backend)
npm run dev
```

Die App ist dann erreichbar unter: **http://localhost:5173**

## Projektstruktur

```
├── server/                  # Backend
│   ├── index.ts             # Express Server (Port 3001)
│   ├── database.ts          # SQLite Setup & Schema
│   ├── seed.ts              # Testdaten
│   └── routes/
│       ├── vertraege.ts     # CRUD Verträge
│       ├── ereignisse.ts    # CRUD Termine/Events
│       ├── historie.ts      # Änderungshistorie
│       ├── dashboard.ts     # Statistiken
│       └── benutzer.ts      # Benutzerverwaltung
├── shared/
│   └── types.ts             # Gemeinsame TypeScript-Typen
├── src/                     # Frontend
│   ├── App.tsx              # Routing
│   ├── api.ts               # API-Client
│   ├── utils.ts             # Formatierungs-Hilfsfunktionen
│   ├── components/
│   │   ├── Layout.tsx       # Navigation & Layout
│   │   ├── StatusBadge.tsx  # Status/Art/Typ Badges
│   │   └── EreignisModal.tsx # Termin-Dialog
│   └── pages/
│       ├── Dashboard.tsx
│       ├── VertragListe.tsx
│       ├── VertragDetail.tsx
│       ├── VertragFormular.tsx
│       ├── Handlungsbedarf.tsx
│       └── Reporting.tsx
```

## Datenmodell

- **Vertrag** – Stammdaten, Lieferant, Laufzeiten, Konditionen, IT-Bezug
- **Ereignis** – Termine mit Typ (Kündigung, Laufzeitende, Review, Preisanpassung, ...), Status, Erinnerungsvorlauf
- **Historie** – Änderungsprotokoll (Aktion, Feld, alter/neuer Wert, Benutzer, Zeitpunkt)
- **Benutzer** – Rollen: Admin, Owner, Viewer

## Vertragsarten

- **IT-Wartungsverträge** (Software/Hardware-Support)
- **IT-Leasingverträge** (Server, Notebooks, Drucker)

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/vertraege` | Vertragsliste mit Filtern |
| GET | `/api/vertraege/:id` | Vertragsdetail mit Ereignissen |
| POST | `/api/vertraege` | Vertrag anlegen |
| PUT | `/api/vertraege/:id` | Vertrag bearbeiten |
| DELETE | `/api/vertraege/:id` | Vertrag löschen |
| GET | `/api/ereignisse` | Ereignisse filtern |
| GET | `/api/ereignisse/handlungsbedarf` | Offene Termine nächste 90 Tage |
| POST | `/api/ereignisse` | Termin anlegen |
| PUT | `/api/ereignisse/:id` | Termin bearbeiten |
| DELETE | `/api/ereignisse/:id` | Termin löschen |
| GET | `/api/historie` | Änderungshistorie |
| GET | `/api/dashboard/stats` | Dashboard-Statistiken |
| GET | `/api/benutzer` | Benutzerliste |
