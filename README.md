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

## Notifications (background reminders)

Remindly can schedule alerts **while the app is closed** using your browser’s PWA + scheduled notification APIs (no server required).

### Setup (do all three)

1. Open Remindly on **Chrome** (Android or desktop) or **Edge**.
2. On Home, tap **Enable notifications** → choose **Allow**.
3. **Install the app**: browser menu → **Install app** / **Add to Home screen**.

After enabling, reminders are resynced whenever you add or change events/tasks.

### What gets scheduled

| Reminder | When |
|----------|------|
| Event today | 8:00 AM on the event date |
| Event starting | 9:00 AM on the event date (default time if you only picked a date) |
| Event soon | 1 hour before |
| Urgent / high tasks | Next 9:00 AM until completed |

### Browser support

| Platform | Background alerts (app closed) |
|----------|--------------------------------|
| Chrome Android + installed PWA | Yes |
| Chrome / Edge desktop + installed PWA | Yes |
| Safari iPhone | Limited — mostly while app is open |
| Firefox | Limited scheduled trigger support |

**iPhone users:** use Chrome on Android, or keep Remindly installed and open it daily; Safari does not fully support scheduled web notifications yet.

### Deploy for mobile

Background notifications require **HTTPS**. Deploy `dist/` to Vercel/Netlify, open that URL on your phone, install to home screen, then enable notifications.

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
