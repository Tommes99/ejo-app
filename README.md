# EJO-App

Vereinfachtes Verwaltungstool fuer eine Jugendorganisation. Die App bietet Aufgabenverwaltung, Jahresplanung, einen Kalender und einen Newsfeed — optimiert fuer den Einsatz bei Veranstaltungen auf mobilen Geraeten.

## Tech-Stack

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI-Bibliothek |
| TypeScript | 5 | Typsicherheit |
| Tailwind CSS | 4 | Styling |
| Supabase | - | Authentifizierung + PostgreSQL-Datenbank |
| @hello-pangea/dnd | 18 | Drag-and-Drop (Kanban + Jahresplanung) |
| react-big-calendar | 1.x | Kalenderansichten (Monat/Woche) |
| dayjs | 1.x | Datumsformatierung (deutsche Locale) |
| lucide-react | - | Icon-Bibliothek |

## Supabase-Zugangsdaten

> **Achtung:** Dieses Repository nicht oeffentlich teilen, solange hier Zugangsdaten stehen.

| Feld | Wert |
|---|---|
| Projekt-URL | `https://poxcdrvzdvipkrozfjej.supabase.co` |
| Anon Key | `sb_publishable_Ek3XHj1bVjW2fihxivMO4Q_OfnXJ9-B` |
| DB-Passwort | `all4muile43348` |
| Direct String | `postgresql://postgres:all4muile43348@db.poxcdrvzdvipkrozfjej.supabase.co:5432/postgres` |

## Erste Schritte

### 1. Abhaengigkeiten installieren

```bash
npm install
```

### 2. Supabase-Projekt einrichten

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Kopiere `.env.local.example` nach `.env.local` und trage deine Supabase-Zugangsdaten ein:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. Datenbank-Migrationen ausfuehren

Fuehre die SQL-Dateien in `supabase/migrations/` **der Reihenfolge nach** im Supabase SQL-Editor aus:

| Datei | Inhalt |
|---|---|
| `001_profiles.sql` | Benutzerprofile, Auto-Erstellung bei Registrierung, updated_at-Trigger |
| `002_projects.sql` | Projekte (Aufgabengruppierung) |
| `003_tasks.sql` | Aufgaben mit Status, Zuweisung, Deadline, Projekt-Referenz |
| `004_events.sql` | Events, Event-Vorlagen (5 Standardvorlagen), Verantwortliche |
| `005_news.sql` | Neuigkeiten/Ankuendigungen |

### 4. Supabase Auth konfigurieren

In den Supabase-Projekteinstellungen unter **Authentication > Providers > Email**:
- Setze "Confirm email" auf **aus** (fuer einfacheres MVP-Onboarding)
- Alternativ: aktiviert lassen und E-Mail-Templates anpassen

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Oeffne [http://localhost:3000](http://localhost:3000) im Browser. Die App leitet automatisch zu `/login` oder `/dashboard` weiter.

## Architektur

### Verzeichnisstruktur

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentifizierungsseiten (ohne Sidebar)
│   │   ├── login/                # Anmeldeseite
│   │   ├── signup/               # Registrierungsseite
│   │   └── auth/callback/        # Supabase OAuth-Callback
│   │
│   ├── (app)/                    # Authentifizierte Seiten (mit Sidebar)
│   │   ├── dashboard/            # Startseite mit Widgets
│   │   ├── aufgaben/             # Aufgabenverwaltung (Liste + Kanban)
│   │   │   ├── neu/              # Neue Aufgabe erstellen
│   │   │   └── [id]/             # Aufgabe bearbeiten
│   │   ├── projekte/             # Projektverwaltung
│   │   │   ├── neu/              # Neues Projekt
│   │   │   └── [id]/             # Projekt-Detail mit Aufgaben
│   │   ├── jahresplanung/        # Jahresuebersicht-Grid
│   │   ├── kalender/             # Kalenderansicht
│   │   └── neuigkeiten/          # Newsfeed
│   │       └── neu/              # Neue Neuigkeit
│   │
│   ├── layout.tsx                # Root-Layout (Fonts, Tailwind)
│   └── page.tsx                  # Redirect: auth-check -> /dashboard oder /login
│
├── components/
│   ├── ui/                       # Wiederverwendbare UI-Bausteine
│   │   ├── Button.tsx            # Varianten: primary, secondary, danger, ghost
│   │   ├── Input.tsx             # Text-Input mit Label und Fehlermeldung
│   │   ├── Select.tsx            # Dropdown mit Label
│   │   ├── Modal.tsx             # Dialog-Overlay
│   │   ├── Badge.tsx             # Status-/Label-Pill
│   │   ├── Card.tsx              # Container-Karte
│   │   ├── Tabs.tsx              # Umschalt-Tabs (z.B. Liste/Kanban)
│   │   ├── LoadingSpinner.tsx    # Ladeanzeige
│   │   └── EmptyState.tsx        # Platzhalter bei leeren Listen
│   │
│   ├── layout/                   # App-Shell-Komponenten
│   │   ├── AppShell.tsx          # Wrapper: Sidebar + Header + Content
│   │   ├── Sidebar.tsx           # Navigation (6 Module, aktiver Zustand)
│   │   └── Header.tsx            # Benutzer-Menu mit Abmelden
│   │
│   ├── auth/                     # LoginForm, SignupForm
│   ├── aufgaben/                 # TaskList, TaskKanban, TaskCard, TaskForm, TaskFilters
│   ├── projekte/                 # ProjectCard, ProjectForm
│   ├── jahresplanung/            # YearGrid, EventChip, EventForm, EventDetailModal
│   ├── kalender/                 # CalendarView (react-big-calendar Wrapper)
│   └── dashboard/                # NewsFeed, UpcomingTasks, UpcomingEvents, QuickActions
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser-Client (createBrowserClient)
│   │   ├── server.ts             # Server-Client (createServerClient + Cookies)
│   │   └── middleware.ts         # Session-Refresh + Routenschutz
│   ├── hooks/
│   │   ├── useUser.ts            # Aktuelles Profil + alle Profile laden
│   │   ├── useTasks.ts           # Aufgaben-CRUD mit Filtern
│   │   ├── useProjects.ts        # Projekte-CRUD
│   │   ├── useEvents.ts          # Events-CRUD + Vorlagen laden
│   │   └── useNews.ts            # Neuigkeiten-CRUD
│   ├── types/database.ts         # TypeScript-Typen (Profile, Task, Event, ...)
│   ├── constants.ts              # Status-Optionen, Nav-Items, Farben, Vorlagen
│   └── utils.ts                  # Datumsformatierung, cn(), getInitials(), isValidDay()
│
└── styles/
    └── globals.css               # Tailwind v4 + react-big-calendar Overrides

middleware.ts                     # Next.js Middleware (Auth-Guard)
supabase/migrations/              # SQL-Migrationen (001-005)
```

### Route Groups

Die App nutzt Next.js **Route Groups** fuer zwei unterschiedliche Layouts:

- **`(auth)`** — Anmelde- und Registrierungsseiten. Zentriertes Layout ohne Sidebar. Authentifizierte Benutzer werden automatisch zu `/dashboard` weitergeleitet.
- **`(app)`** — Alle authentifizierten Seiten. Layout mit Sidebar-Navigation, Header und Benutzer-Menu. Nicht-authentifizierte Benutzer werden zu `/login` weitergeleitet.

### Authentifizierung

```
Browser  ──>  middleware.ts  ──>  Supabase Auth
                   │
         Session vorhanden?
          /              \
        Ja               Nein
        │                 │
   Seite laden     Redirect /login
```

- **Registrierung:** Supabase `signUp()` mit `full_name` in Metadaten. Ein Datenbank-Trigger erstellt automatisch einen `profiles`-Eintrag.
- **Anmeldung:** Supabase `signInWithPassword()`. Session wird via Cookies gespeichert.
- **Middleware:** Jeder Request durchlaeuft `middleware.ts`, das die Session auffrischt und unauthentifizierte Zugriffe auf geschuetzte Routen abfaengt.
- **Abmelden:** `signOut()` loescht die Session-Cookies und leitet zu `/login` weiter.

### Datenbank-Schema

```
auth.users ──1:1──> profiles
                        │
                    ┌───┴───┐
                    │       │
                projects   news
                    │
                  tasks
                    │
               (assigned_to ──> profiles)

event_templates ──> events ──M:N──> event_responsibles ──> profiles
```

**Row-Level Security (RLS):** Alle Tabellen haben RLS aktiviert. Da alle registrierten Benutzer vollen Zugriff haben, erlauben die Policies einfach `authenticated`-Zugriff fuer alle Operationen.

## Module

### Startseite (`/dashboard`)

Die Startseite bietet einen Ueberblick ueber die aktuelle Lage:

- **Quick Actions** — Schnellzugriff-Buttons zum Erstellen von Aufgaben, Projekten und Events
- **Neuigkeiten** — Die letzten 5 News-Posts, angeheftete Beitraege zuerst
- **Naechste Aufgaben** — Die 5 naechsten Aufgaben nach Deadline (nicht archivierte)
- **Naechste Events** — Die 5 naechsten Events nach Startdatum

### Aufgaben (`/aufgaben`)

Vollstaendige Aufgabenverwaltung mit zwei Ansichten:

- **Listenansicht** — Aufgaben als Karten mit Titel, Status-Badge, zugewiesener Person, Deadline und Projekt
- **Kanban-Board** — Vier Spalten (Offen, In Bearbeitung, Erledigt, Archiviert) mit Drag-and-Drop zum Status-Wechsel
- **Filter** — Nach Status, zugewiesener Person und Projekt filterbar
- **CRUD** — Aufgaben erstellen, bearbeiten, zuweisen und loeschen. Loeschen mit Bestaetigung

**Status-Werte:** `offen` | `in_bearbeitung` | `erledigt` | `archiviert`

### Projekte (`/projekte`)

Projekte gruppieren Aufgaben thematisch (z.B. "Sommerlager 2026"):

- **Uebersicht** — Projekt-Karten mit Farbpunkt und Beschreibung
- **Detail** — Projekt bearbeiten + alle zugehoerigen Aufgaben anzeigen
- **Farbauswahl** — 10 vordefinierte Farben fuer die visuelle Unterscheidung

### Jahresplanung (`/jahresplanung`)

Ganzjahresuebersicht als interaktives Grid:

- **Grid** — 12 Spalten (Monate) x 31 Zeilen (Tage). Ungueltige Tage (z.B. 30. Februar) sind ausgegraut
- **Navigation** — Jahrwechsel mit Pfeil-Buttons
- **Events erstellen** — Klick auf eine leere Zelle oeffnet das Formular mit vorausgefuelltem Datum
- **Drag-and-Drop** — Bestehende Events koennen auf andere Tage gezogen werden (Dauer bleibt erhalten)
- **Event-Vorlagen** — 5 Standardvorlagen (Gruppenstunde, Lager, Elternabend, Leiterrunde, Aktion) fuellen Titel, Farbe und Dauer vor
- **Detail-Ansicht** — Klick auf ein Event zeigt Beschreibung, Notizen und Verantwortliche
- **Verantwortliche** — Mehrere Benutzer koennen einem Event zugewiesen werden

### Kalender (`/kalender`)

Klassische Kalenderansicht mit Monats- und Wochenansicht:

- **Datenquellen** — Zeigt sowohl Aufgaben (nach Deadline) als auch Events in einer gemeinsamen Ansicht
- **Farbcodierung** — Aufgaben erhalten die Farbe ihres Projekts, Events ihre eigene Farbe
- **Deutsche Locale** — Toolbar-Labels (Heute, Zurueck, Weiter, Monat, Woche) auf Deutsch
- **Detail-Popup** — Klick auf einen Eintrag zeigt Details und einen Link zur Bearbeitungsseite

### Neuigkeiten (`/neuigkeiten`)

Einfacher Newsfeed fuer Ankuendigungen:

- **Erstellen** — Titel, Inhalt und optionales Anheften
- **Angeheftete Beitraege** — Werden immer zuerst angezeigt
- **Loeschen** — Direkt aus der Liste heraus

## Datenfluesse

### Client-seitig (Hooks)

Die meisten Datenoperationen laufen ueber Custom Hooks, die den Supabase Browser-Client nutzen:

```
Komponente  ──>  useHook()  ──>  Supabase Browser-Client  ──>  PostgreSQL
                    │
              Lokaler State
              (optimistisch)
```

Die Hooks (`useTasks`, `useProjects`, `useEvents`, `useNews`) bieten jeweils:
- Automatisches Laden beim Mount
- CRUD-Funktionen mit automatischem State-Update
- Optionale Filter (bei `useTasks`)

### Server-seitig

Das App-Layout (`(app)/layout.tsx`) ist eine Server-Komponente, die:
1. Den authentifizierten Benutzer prueft
2. Das Profil aus der Datenbank laedt
3. Beides an die Client-Shell-Komponente weitergibt

## Deployment auf Vercel

1. Repository mit Vercel verbinden
2. Environment-Variablen setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deployen — Vercel erkennt Next.js automatisch

### Build

```bash
npm run build    # Produktions-Build erstellen
npm run start    # Produktions-Server starten
npm run dev      # Entwicklungsserver mit Hot-Reload
npm run lint     # ESLint ausfuehren
```

## Projektentscheidungen

| Entscheidung | Begruendung |
|---|---|
| Kein Rollen-System | Alle Benutzer haben gleichen Zugriff — einfacher fuer kleine Organisationen |
| Supabase statt eigener API | RLS uebernimmt die Autorisierung auf Datenbankebene, kein separater API-Layer noetig |
| @hello-pangea/dnd | Aktiv gepflegter Fork von react-beautiful-dnd, Touch-Support fuer Mobile |
| react-big-calendar + dayjs | Bewaehrte Kalender-Bibliothek mit deutscher Lokalisierung |
| Tailwind v4 direkt | Kein UI-Framework (shadcn, Radix etc.) — haelt das Bundle klein und die Abhaengigkeiten minimal |
| Client-seitige Hooks fuer CRUD | Einfacher als Server Actions fuer interaktive Komponenten (Kanban, Grid) |
