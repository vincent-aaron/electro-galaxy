# 🗄 Electro Galaxy — Backup & Restore Guide

This guide explains how to back up and restore the Electro Galaxy project's **code** and **database** so you never lose work.

---

## 1. Overview

Two things need backing up:

| What                  | Where it lives                   | How to back up                  |
| --------------------- | -------------------------------- | ------------------------------- |
| **Source code**       | Local project folder (this repo) | Git / ZIP / cloud repo (GitHub) |
| **Supabase database** | Cloud (Supabase)                 | Supabase CLI or Dashboard       |

---

## 2. Backing up the Source Code

### Option A — Git (recommended)

```bash
# Initialize git (first time only)
git init
git add .
git commit -m "Initial backup"

# Link to a remote (GitHub/GitLab)
git remote add origin <your-repo-url>
git push -u origin main
```

### Option B — ZIP snapshot

Every so often, create a ZIP of the project folder (excluding `node_modules` and `.next`):

```bash
# On Windows (PowerShell) — this excludes heavy build folders
Compress-Archive -Path "c:/Users/Vincent Aaron/Documents/Projects/Electro Galaxy/*" -DestinationPath "electro-galaxy-backup.zip"
```

> ⚠️ **Never commit `.env` to git** — it contains your Supabase anon key and service role key. Keep it local or store it in a secret manager.

---

## 3. Backing up the Supabase Database

### Option A — Supabase CLI (recommended)

Make sure the CLI is installed and you are logged in:

```bash
supabase --version
supabase login
# paste your access token when prompted
```

**Backup (dump) the database:**

```bash
# Dump the schema + data to a SQL file
supabase db dump -p ohqulaqzxfgupgelrqbi --schema public,temp -f supabase/backup.sql
```

Or with the full database:

```bash
supabase db dump -p ohqulaqzxfgupgelrqbi -f supabase/full-backup.sql
```

### Option B — Dashboard (manual)

1. Go to your project: https://supabase.com/dashboard/project/ohqulaqzxfgupgelrqbi
2. **Database → Backups** tab.
3. Click **Create a backup** (or enable continuous backups on paid plans).
4. Or use **SQL Editor** → run `SELECT` dumps to copy specific tables.

> The schema is also stored in `supabase/schema.sql`, so you can always recreate the structure.

---

## 4. Restoring the Database

### Restore from SQL dump using the CLI

```bash
# Load a SQL file into the remote database
supabase db push
# OR for a specific dump:
psql "$(supabase db url -p ohqulaqzxfgupgelrqbi)" -f supabase/backup.sql
```

### Restore from schema.sql (recreate structure)

If you only need to recreate the tables (no data):

1. Open https://supabase.com/dashboard/project/ohqulaqzxfgupgelrqbi/sql
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

Then re-seed data:

```bash
npm run db:seed
```

---

## 5. Environment Variables (must-backup)

These live in `.env` but are **git-ignored**. Store them somewhere safe:

```
NEXT_PUBLIC_SUPABASE_URL=https://ohqulaqzxfgupgelrqbi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_GEMINI_API_KEY=<gemini api key>
```

### Recommended backup methods for secrets

- **Vercel Environment Variables** (if deployed) — safe place to store them.
- **1Password / LastPass** — personal secret manager.
- **A private, protected file** on your machine (never in public git).

---

## 6. Recommended Backup Schedule

| Frequency               | What                               |
| ----------------------- | ---------------------------------- |
| **After every feature** | Git commit + push                  |
| **Weekly**              | `supabase db dump` (database)      |
| **Monthly**             | Full ZIP snapshot + review secrets |

---

## 7. Quick Recovery Checklist

If disaster strikes:

1. Restore code from Git: `git pull` or re-clone the repo.
2. Recreate `.env` from your saved secrets.
3. Restore DB: `npm run db:seed` (if data gone) or load `supabase/backup.sql`.
4. `npm install` and `npm run dev` to verify.

---

_Electro Galaxy — keep your work safe!_
