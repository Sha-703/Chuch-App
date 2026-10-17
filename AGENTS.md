# ChurchApp — AGENTS.md

## Repo shape
Deux packages dans un seul dépôt, sans outil de test/lint/typecheck installé :
- `churchapp-backend/` — Node/Express + Sequelize + SQLite (dev), API sur `:4000/api`
- `churchapp-frontend/` — React 18 + Vite + Tailwind, dev sur `:5173`, build → `dist/`

À la racine : docs uniquement (`README.md`, `CAHIER_DES_CHARGES.md`, `ROADMAP.md`).
**Aucun fichier `.env` n'existe nulle part** (pas même `.env.example`).

## Ordre de démarrage (backend d'abord, puis frontend)
1. `cd churchapp-backend && npm install && npm run seed && npm run dev`
   - `seed` lance `sequelize.sync({ force: true })` : **écrase et reseede** la base SQLite (`./data/churchapp.sqlite`)
   - Logins démo : `pasteur@demo.cd` / `demo1234`, `admin@demo.cd` / `demo1234`
   - Super Admin : `superadmin@churchapp.cd` / `demo1234`
2. `cd churchapp-frontend && npm install`
   - Créer `.env` manuellement : `VITE_API_URL=http://localhost:4000/api`
   - `npm run dev` → `:5173`

## Commandes
Backend : `npm run dev` (watch), `npm start`, `npm run seed`
Frontend : `npm run dev`, `npm run build`, `npm run preview` (port 3000)
**Aucun** `npm test`, `npm run lint` ou typecheck dans aucun des deux packages.

## Points d'architecture (à ne pas oublier)
- Multi-tenant : chaque requête d'église est scopée par `egliseId` du JWT (middleware `tenantScope`). Ne jamais ajouter une requête Sequelize sans ce filtre.
- Super Admin totalement séparé : modèle/JWT distincts (`isSuperAdmin: true`), login dédié (`/super-admin`), routes sous `/api/super-admin`. Un token d'église ne peut pas atteindre les routes super-admin (et inversement).
- CORS : backend autorise `*` par défaut sauf si `CORS_ORIGIN` est défini. Vite n'a **pas de proxy** — le backend doit autoriser l'origine du frontend.
- Uploads stockés en local (`./uploads`, servis sous `/uploads`) : à basculer vers un stockage objet avant la production.
- Capture caméra (`getUserMedia`) exige l'HTTPS en production (fonctionne sur `localhost` sans certificat).
- Pas de migrations : `sequelize.sync()` uniquement. Pour la production, passer SQLite → PostgreSQL (voir backend README).

## Déploiement
- Backend : Railway, commande `npm start`, variables `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL` (PostgreSQL)
- Frontend : Vercel/Netlify, dossier `dist/`, variable `VITE_API_URL` vers l'URL du backend