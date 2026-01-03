# Deployment Guide - Desperate Hordewipes

## Vercel Deployment

### 1. Vorbereitung
Stellen Sie sicher, dass Ihr Code in einem Git-Repository (GitHub, GitLab, Bitbucket) liegt.

### 2. Vercel Setup
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Melden Sie sich an und verbinden Sie Ihr Git-Repository
3. Wählen Sie das `desperate-hordewipes-nextjs` Projekt aus

### 3. Umgebungsvariablen konfigurieren
Fügen Sie diese Umgebungsvariablen in Vercel hinzu:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_random_secret_key_min_32_chars
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

### 4. Supabase Setup
1. Erstellen Sie ein kostenloses Supabase-Projekt auf [supabase.com](https://supabase.com)
2. Gehen Sie zu Settings → API um Ihre URLs und Keys zu finden
3. Führen Sie das SQL-Schema aus `supabase/schema.sql` in der SQL-Editor aus
4. Tragen Sie die Supabase-Daten in Vercel ein

### 5. Deploy
- Vercel deployed automatisch bei jedem Git-Push
- Oder klicken Sie "Deploy" im Vercel Dashboard

## Wichtige Hinweise

### Runtime-Konfiguration
- Alle API Routes sind für Node.js Runtime konfiguriert (`export const runtime = 'nodejs'`)
- Dies ist notwendig für JWT und bcrypt Funktionalität

### Standard-Login
- **Username:** admin
- **Password:** admin123
- **⚠️ WICHTIG:** Ändern Sie das Passwort sofort nach dem ersten Login!

### Troubleshooting

#### Build-Fehler
Wenn Sie Fehler beim Build bekommen:
1. Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind
2. Prüfen Sie die Vercel-Logs im Dashboard
3. Testen Sie den Build lokal: `npm run build`

#### Runtime-Fehler
- JWT/bcrypt Fehler → Prüfen Sie die `export const runtime = 'nodejs'` Zeilen
- Supabase-Fehler → Prüfen Sie die Umgebungsvariablen
- 404-Fehler → Prüfen Sie die Routing-Konfiguration

## Alternative Deployment-Plattformen

### Netlify
1. Verbinden Sie Ihr Repository
2. Build Command: `npm run build`
3. Publish Directory: `.next`
4. Fügen Sie Umgebungsvariablen hinzu

### Railway
1. Verbinden Sie Ihr Repository
2. Fügen Sie Umgebungsvariablen hinzu
3. Railway erkennt Next.js automatisch

### Eigener Server
1. `npm run build`
2. `npm start`
3. Nginx/Apache Reverse Proxy auf Port 3000
4. SSL-Zertifikat einrichten

## Performance-Optimierung

### Für Produktion
- Aktivieren Sie Vercel Analytics
- Konfigurieren Sie CDN für Bilder
- Nutzen Sie Vercel Edge Functions für bessere Performance

### Monitoring
- Vercel bietet integriertes Monitoring
- Supabase Dashboard für Datenbank-Metriken
- Fehler-Tracking mit Sentry (optional)

## Sicherheit

### Produktions-Checkliste
- [ ] Standard-Admin-Passwort geändert
- [ ] HTTPS aktiviert
- [ ] Umgebungsvariablen sicher gespeichert
- [ ] Supabase RLS (Row Level Security) aktiviert
- [ ] Starkes NEXTAUTH_SECRET (min. 32 Zeichen)

---

**Für die Horde! 🗡️**
