# RSJ Tech AI Readiness Audit

Public-facing audit tool that captures leads and generates personalised AI Readiness Reports.

## Folder structure

```
audit-app/
  index.html          ← entry point
  vite.config.js      ← build config
  package.json        ← dependencies
  .gitignore
  public/
    favicon.svg
  src/
    main.jsx          ← mounts the app
    App.jsx           ← main application (copy rsj-audit-tool.jsx here, renamed)
```

## Setup

1. Copy `rsj-audit-tool.jsx` into `src/` and rename it `App.jsx`
2. Open `src/App.jsx` and update the CONFIG block at the top:
   - `calendlyUrl` — your Calendly booking link
   - `privacyPolicyUrl` — URL of your hosted privacy policy
   - `notificationEmail` — where to send new lead alerts
   - EmailJS keys once you have set those up
3. Run locally:

```bash
npm install
npm run dev
```

4. Deploy to Vercel — see deployment instructions below.

## Deploying to Vercel

1. Push this folder to a GitHub repo called `rsj-audit-tool`
2. Go to vercel.com and click "Add New Project"
3. Import the `rsj-audit-tool` repo
4. Vercel will auto-detect Vite. Leave all settings as default.
5. Click Deploy — done in about 60 seconds.
6. Your live URL will be `rsj-audit-tool.vercel.app`
7. To use your own domain (e.g. `audit.rsjtech.co.uk`):
   - Go to Project Settings > Domains in Vercel
   - Add `audit.rsjtech.co.uk`
   - Add a CNAME record in your DNS pointing to `cname.vercel-dns.com`

## Shared storage note

The audit tool and dashboard share data via the Claude artifact storage layer.
Both apps must be deployed as Claude artifacts (via claude.ai) for the shared
storage to work. If you move to a self-hosted backend later, replace the
`window.storage` calls with API calls to your own database (Supabase recommended).
