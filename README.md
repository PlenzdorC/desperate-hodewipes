# Desperate Hordewipes - Next.js & Supabase

Eine moderne World of Warcraft Gildenseite gebaut mit Next.js 14, TypeScript, Tailwind CSS und Supabase.

## Features

### Hauptwebsite
- **Responsive Design** - Funktioniert auf allen Geräten
- **Moderne UI/UX** - Ansprechendes Design im WoW-Theme mit Tailwind CSS
- **Dynamische Inhalte** - Daten werden aus Supabase geladen
- **Bewerbungsformular** - Spieler können sich direkt bewerben
- **Raid Progress** - Aktuelle Fortschritte werden angezeigt
- **Event Kalender** - Kommende Events und Termine
- **Mitglieder Galerie** - Übersicht aller Gildenmitglieder

### Admin Dashboard
- **Sichere Authentifizierung** - JWT-basiertes Login-System
- **Dashboard Übersicht** - Statistiken und aktuelle Aktivitäten
- **Mitglieder Verwaltung** - CRUD Operationen für Gildenmitglieder
- **Bewerbungen verwalten** - Review und Genehmigung von Bewerbungen
- **Event Management** - Erstellen und verwalten von Guild Events
- **Raid Progress** - Aktualisierung der Boss-Kills und Fortschritte

## Technische Details

### Frontend
- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS** - Utility-first CSS Framework
- **Lucide React** - Moderne Icon-Bibliothek

### Backend
- **Supabase** - Backend-as-a-Service mit PostgreSQL
- **Next.js API Routes** - Server-side API Endpoints
- **JWT Authentication** - Sichere Admin-Authentifizierung
- **Row Level Security** - Datenbankebene Sicherheit

### Datenbank Schema
- **admin_users** - Admin-Benutzer
- **members** - Gildenmitglieder
- **applications** - Bewerbungen
- **raids** - Raid-Instanzen
- **bosses** - Boss-Encounter
- **events** - Guild Events
- **gallery** - Bilder-Galerie
- **guild_settings** - Konfiguration
- **activity_log** - Aktivitäts-Protokoll

## Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase Account

### Schritte

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd desperate-hordewipes-nextjs
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Supabase Projekt erstellen**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt
   - Kopiere die URL und API Keys

4. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.example .env.local
   ```
   
   Fülle die Werte in `.env.local` aus:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Datenbank Schema einrichten**
   - Öffne Supabase Dashboard → SQL Editor
   - Führe das SQL aus `supabase/schema.sql` aus

6. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

7. **Seite öffnen**
   - Hauptseite: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

### Standard-Login
- **Benutzername:** admin
- **Passwort:** admin123

**⚠️ WICHTIG:** Ändere das Standard-Passwort sofort nach der Installation!

## API Endpoints

### Öffentliche Endpoints
- `GET /api/settings` - Guild-Einstellungen
- `GET /api/members` - Mitglieder-Liste
- `GET /api/raids` - Raid-Progress
- `GET /api/events` - Kommende Events
- `POST /api/applications` - Bewerbung einreichen

### Admin Endpoints (Authentifizierung erforderlich)
- `POST /api/auth/login` - Admin Login
- `POST /api/auth/logout` - Admin Logout
- `GET /api/applications` - Alle Bewerbungen abrufen

## Deployment

### Vercel (Empfohlen)
1. Pushe den Code zu GitHub
2. Verbinde das Repository mit Vercel
3. Konfiguriere die Umgebungsvariablen in Vercel
4. Deploy!

### Andere Plattformen
- Stelle sicher, dass Node.js 18+ unterstützt wird
- Konfiguriere die Umgebungsvariablen
- Führe `npm run build` aus
- Starte mit `npm start`

## Anpassungen

### Design
- Farben können in `tailwind.config.ts` angepasst werden
- Komponenten in `src/components/` bearbeiten
- Neue Tailwind-Klassen verwenden

### Gilde-Informationen
- Über das Admin-Dashboard unter "Einstellungen"
- Oder direkt in Supabase in der Tabelle `guild_settings`

### Neue Features
- Neue Komponenten in `src/components/` erstellen
- API Routes in `src/app/api/` hinzufügen
- Datenbankschema in Supabase erweitern

## Sicherheit

### Empfohlene Maßnahmen
1. **Standard-Passwort ändern** - Sofort nach Installation
2. **HTTPS verwenden** - SSL-Zertifikat in Produktion
3. **Umgebungsvariablen sichern** - Niemals in Git committen
4. **Supabase RLS** - Row Level Security ist aktiviert
5. **JWT Secret** - Verwende einen starken, zufälligen Schlüssel

### Sicherheitsfeatures
- JWT-basierte Authentifizierung
- HTTP-only Cookies für Token
- Row Level Security in Supabase
- TypeScript für Typsicherheit
- Middleware für Route-Schutz

## Troubleshooting

### Häufige Probleme

1. **"Supabase connection failed"**
   - Prüfe die Umgebungsvariablen
   - Stelle sicher, dass das Supabase-Projekt aktiv ist

2. **"Authentication failed"**
   - Prüfe JWT Secret in Umgebungsvariablen
   - Lösche Browser-Cookies und versuche erneut

3. **"API endpoint not found"**
   - Stelle sicher, dass der Entwicklungsserver läuft
   - Prüfe die API Route Pfade

4. **Styling-Probleme**
   - Führe `npm run build` aus um Tailwind zu kompilieren
   - Prüfe die Tailwind-Konfiguration

### Debug-Modus
```bash
# Entwicklung mit Debug-Logs
npm run dev

# Build für Produktion
npm run build
npm start
```

## Mitwirken

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Pushe zum Branch
5. Erstelle einen Pull Request

## Lizenz

MIT License - siehe LICENSE-Datei für Details.

## Support

Bei Fragen oder Problemen:
1. Prüfe die Troubleshooting-Sektion
2. Schaue in die Browser-Konsole für Fehler
3. Prüfe die Supabase Logs
4. Erstelle ein GitHub Issue mit detaillierter Fehlerbeschreibung

---

**Für die Horde! 🗡️**