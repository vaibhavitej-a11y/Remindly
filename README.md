# Remindly

A local-first task and event planner. No login, no backend — your data stays in the browser.

## Features

- **Home** — live stats, priority feed (tap to open tasks), upcoming events
- **Projects** — tasks with priorities (urgent, high, medium, low)
- **Calendar** — month view and daily agenda
- **Notifications** — browser alerts while the app is open (see below)
- **Mobile-friendly** — works in phone browsers; add to home screen for an app-like feel

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Use on your phone (same Wi‑Fi)

```bash
npm run dev -- --host
```

On your phone, open `http://<your-computer-ip>:3000` (e.g. `http://192.168.1.5:3000`).

For use anywhere, deploy the `dist` folder (after `npm run build`) to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or GitHub Pages, then open that URL on mobile.

## Notifications (important)

Remindly uses **browser notifications**, not push servers.

| What you get | Limitation |
|--------------|------------|
| Alert when an **event is today** | Only while the app tab is open (or recently used) |
| Alert when an event is **within ~1 hour** | Checks every minute while the app is open |
| Alert for new **urgent / high** tasks | Once per task per session |

You must **allow notifications** when the browser asks. Notifications do **not** run in true background like WhatsApp unless you deploy as a PWA and the browser supports background sync (limited on iOS).

## Data

Stored in `localStorage` under `remindly-data`. Clearing site data removes your projects and tasks.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check |

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Remindly local planner"
git branch -M main
git remote add origin https://github.com/YOUR_USER/remindly.git
git push -u origin main
```
