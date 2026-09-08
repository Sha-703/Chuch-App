# ChurchApp — Frontend

Dashboard React (Vite + Tailwind + Recharts) pour la plateforme de transparence
et de gestion d'église. **Branché sur le backend réel** (`../eglise-backend`) —
plus aucune donnée mockée n'est utilisée dans l'application.

## Démarrer en local

```bash
npm install
cp .env.example .env   # VITE_API_URL doit pointer vers ton backend
npm run dev
```

Ouvre http://localhost:5173 — assure-toi que le backend tourne sur
http://localhost:4000 (voir `eglise-backend/README.md`, `npm run seed` puis
`npm run dev`).

Identifiants de démo : `pasteur@demo.cd` / `demo1234`

## Build de production

```bash
npm run build
```

Le résultat est dans `dist/`. C'est ce dossier qu'il faut déployer.
Pense à définir `VITE_API_URL` vers l'URL de ton backend en production
(variable d'environnement sur Vercel/Netlify).

## Pages incluses

- `/` — Connexion (appelle `POST /api/auth/login`)
- `/creer-eglise` — Inscription d'une nouvelle église en 3 étapes (appelle `POST /api/auth/eglises`)
- `/dashboard` — Vue d'ensemble (bilan mensuel + derniers cultes, données réelles)
- `/finances` — Entrées et charges, avec formulaire d'ajout fonctionnel
- `/cultes` — Historique des cultes + graphique de fréquentation, avec formulaire d'ajout
- `/membres` — Annuaire des membres, avec formulaire d'ajout
- `/rapports` — Bilans mensuels calculés depuis les vraies données

Toutes les pages de données sont protégées (`ProtectedRoute`) et redirigent
vers `/` si aucune session valide n'est présente.

## Architecture

- `src/lib/api.js` — client API centralisé (fetch + token JWT depuis le localStorage)
- `src/context/AuthContext.jsx` — état de session (login/logout) partagé dans toute l'app
- `src/components/ProtectedRoute.jsx` — garde d'accès aux pages authentifiées
- `src/lib/mockData.js` — ne contient plus que `formatFC()` (formatage monétaire), conservé comme utilitaire

## Déploiement

Le dossier `dist/` (statique) peut être déployé gratuitement sur **Vercel** ou
**Netlify** en connectant simplement le dépôt Git. Pense à configurer
`VITE_API_URL` dans les variables d'environnement du projet déployé.

## Scan de document par caméra

La correspondance physique peut être scannée directement via `getUserMedia`
(`src/components/CameraCapture.jsx`). **Important en production : cette API
exige HTTPS** (fonctionne sans certificat en local via `localhost`). Vercel
fournit HTTPS automatiquement, donc aucune configuration supplémentaire
n'est nécessaire au déploiement.

## Système de design (Sacred Assembly)

Le dossier `docs/design-kit/` contient le kit de design de référence
("Sacred Assembly") : palette, typographie, composants et maquettes visuelles
pour chaque page de l'application, y compris les modules à venir (RH,
Planning/Logistique, Super Admin). C'est la référence à suivre pour toute
nouvelle page.

Intégré dans le code au 29/08 :
- Police IBM Plex Mono appliquée systématiquement aux données chiffrées, dates,
  en-têtes de tableau et badges (`.font-tabular` dans `index.css`, classes
  `font-mono` ajoutées aux en-têtes et badges) — effet "registre/archive".
- `StatCard` : icône dans un cercle plus large, libellé en mono capitales.
- Nouveau composant `Footer.jsx` (galon tissé + copyright) ajouté au `Layout`.

Non repris tel quel du kit (adaptation volontaire, pas une copie littérale) :
- Les libellés de navigation du kit sont des placeholders génériques en
  anglais (Sanctuary, Community, Giving...) — on garde nos propres libellés
  français métier (Finances, Cultes, Correspondance...).
- Le mode sombre est spécifié dans `DESIGN.md` mais pas encore implémenté
  (aucune phase du roadmap ne le prévoit pour l'instant).
- La barre de recherche globale du kit correspond à la Phase 8 du roadmap
  (pas encore développée) — on évite d'afficher un champ non fonctionnel.

## Design

- Police d'affichage : Fraunces (serif, ton "registre officiel")
- Police de texte : Work Sans
- Palette : bleu nuit (`ink`), or (`gold`), argile (`clay`), vert feuille (`leaf`)
  sur fond parchemin — inspirée de la sobriété et de la dignité d'un registre
  d'église, avec un motif de "galon tissé" (`.woven-rule` dans `index.css`)
  comme élément signature sous les titres de section.

