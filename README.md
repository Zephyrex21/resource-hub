# Resource Hub — Phase 0: Foundation

This is the foundation layer of the project: a themed React client (light/dark, glass/clay
design tokens, canvas particle background) wired up to an Express + MongoDB backend with a
health-check endpoint. Nothing content-related yet (no Notes/Tips/Projects) — this phase is
purely about proving the stack works end to end, on $0 infrastructure.

## What's in this phase

- `client/` — React + Vite + TypeScript + Tailwind, theme system, canvas particle background
- `server/` — Express + Mongoose, `/api/v1/health` endpoint

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer (`node -v` to check)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (no credit card
  needed for the free M0 tier)

## 1. Set up a free MongoDB Atlas cluster

1. Create an account at mongodb.com/cloud/atlas and create a new project.
2. Build a database → choose the **M0 Free** tier → pick any region close to you.
3. Under **Database Access**, create a database user with a username/password (save these).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) for local dev —
   you can restrict this later once the app is deployed.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to it, e.g. append `resource-hub` before the `?`:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/resource-hub?retryWrites=true&w=majority`

## 2. Run the server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string into `MONGODB_URI`.

```bash
npm run dev
```

You should see:
```
[db] MongoDB connected
[server] Running on http://localhost:5000
```

Visit `http://localhost:5000/api/v1/health` in your browser — you should get:
```json
{ "status": "ok", "db": "connected", "timestamp": "..." }
```

## 3. Run the client

In a **new terminal**:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. You should see:
- A glass navbar with a theme toggle (sun/moon icon, top of the page)
- A canvas particle background (subtle moving dots/lines behind everything)
- A clay-styled hero card
- A status pill reading **"Backend connected · DB: connected"** — this confirms the full
  client → server → database chain is working

Click the theme toggle to confirm dark/light both render correctly and persist on refresh.

## Troubleshooting

- **Status pill says "Backend offline"** — make sure the server is running on port 5000 and
  that `client/.env`'s `VITE_API_URL` matches (`http://localhost:5000/api/v1`).
- **Server logs a MongoDB connection error** — double check the username/password in your
  connection string (special characters in the password need to be URL-encoded), and confirm
  your IP is allowed under Network Access in Atlas.
- **CORS error in the browser console** — confirm `server/.env`'s `CLIENT_ORIGIN` matches the
  client's actual URL (`http://localhost:5173` by default).

## Cost check

Everything here is free: Vite/React/Tailwind/Express/Mongoose are open-source npm packages,
and MongoDB Atlas's M0 tier is free forever (512MB storage, no card required). No paid
services are used anywhere in this phase.

## Next: Phase 1

Data models + API for Notes, Tips, and Projects, plus seed data — building directly on this
foundation.
