# ChurchApp — Backend

API Express + Sequelize (SQLite en développement) pour la plateforme de
transparence et de gestion d'église multi-tenant.

## Démarrer en local

```bash
npm install
cp .env.example .env
npm run seed   # crée la base + une église de démo
npm run dev    # démarre le serveur avec rechargement automatique
```

API disponible sur http://localhost:4000/api

## Identifiants de démo (après `npm run seed`)

- Pasteur : `pasteur@demo.cd` / `demo1234`
- Administrateur : `admin@demo.cd` / `demo1234`

## Routes principales

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | non | Connexion, renvoie un JWT |
| POST | `/api/auth/eglises` | non | Inscription d'une nouvelle église + comptes pasteur/administrateur |
| GET/POST | `/api/finances/entrees` | oui | Lister / créer une entrée (offrande, dîme, don) |
| GET/POST | `/api/finances/charges` | oui | Lister / créer une charge |
| GET | `/api/finances/bilan-mensuel` | oui | Bilan entrées/charges regroupé par mois |
| GET/POST | `/api/cultes` | oui | Lister / enregistrer un culte (présentiel + en ligne) |
| GET/POST | `/api/membres` | oui | Lister / ajouter un membre |
| GET | `/api/eglises` | oui | Annuaire des autres églises du système (pour choisir un destinataire) |
| GET | `/api/correspondances` | oui | Lister le courrier de son église (filtres `?sens=` et `?etat=`) |
| POST | `/api/correspondances/physique` | oui | Enregistrer un courrier physique (upload `document` obligatoire) |
| POST | `/api/correspondances/numerique` | oui | Envoyer un courrier numérique à une église du système ou un tiers |
| PATCH | `/api/correspondances/:id/etat` | oui | Changer l'état (`entrant` / `en_traitement` / `archive`) |
| POST | `/api/correspondances/:id/accuse` | oui | Envoyer l'accusé de réception d'une correspondance entrante |
| GET | `/api/annonces` | oui | Mur d'annonces — visible par **toutes** les églises du système |
| POST | `/api/annonces` | oui | Publier une annonce (upload `photo` optionnel) |
| GET | `/api/finances/bilan-mensuel/pdf?mois=YYYY-MM` | oui | Télécharge le bilan financier d'un mois en PDF |
| GET | `/api/rapports/annuel/pdf?annee=YYYY` | oui | Télécharge le rapport de transparence annuel complet (finances, présence, courrier, annonces) |
| GET/POST/PUT/DELETE | `/api/departements` | oui | Gestion des départements (nom, description, chef, ouvriers) |
| POST | `/api/membres/:id/compte` | oui | Crée un compte de connexion "ouvrier" pour un membre |
| GET | `/api/cultes/:culteId/presences?departementId=` | oui | Tableau de présence individuelle pour un culte (admin), filtrable par département |
| GET | `/api/mon-espace/cultes` | oui (ouvrier) | Liste des cultes avec son propre statut de présence |
| POST | `/api/mon-espace/cultes/:culteId/presence` | oui (ouvrier) | Signer sa présence (present / absent + raison) |
| GET/POST/DELETE | `/api/evenements` | oui | Planning : créer, lister (filtre `?annee=`), supprimer un événement |
| GET | `/api/evenements/prochains` | oui | Événements des 7 prochains jours (widget tableau de bord) |
| GET | `/api/evenements/rappels` | oui | Rappels actifs (date de rappel passée, événement pas encore eu lieu) |
| POST | `/api/super-admin/auth/login` | non | Connexion Super Admin — **compte totalement séparé** des comptes d'église |
| GET | `/api/super-admin/dashboard` | Super Admin | Statistiques système (nb églises, membres, courriers en retard...) |
| GET/PATCH/DELETE | `/api/super-admin/eglises` | Super Admin | Lister, suspendre/réactiver, supprimer une église |
| GET | `/api/super-admin/utilisateurs` | Super Admin | Liste de tous les utilisateurs, toutes églises confondues |
| POST | `/api/super-admin/utilisateurs/:id/reinitialiser-mot-de-passe` | Super Admin | Génère un nouveau mot de passe provisoire |
| PATCH | `/api/super-admin/utilisateurs/:id/toggle-blocage` | Super Admin | Bloque/débloque un compte (empêche la connexion) |
| GET/DELETE | `/api/super-admin/annonces` | Super Admin | Modération du mur d'annonces (toutes églises) |
| GET | `/api/super-admin/journal` | Super Admin | Journal d'activité système (100 dernières entrées) |

## Espace Super Admin — logique clé et points de sécurité

- **Séparation totale et volontaire** : `SuperAdmin` est un modèle indépendant
  de `Utilisateur`, avec son propre JWT (`{ sub, isSuperAdmin: true }`, jamais
  d'`egliseId`) et son propre middleware (`superAdminAuth.js`). Un token
  d'église ne peut jamais accéder aux routes `/api/super-admin/*`, et
  inversement — vérifié par les deux middlewares qui ne se chevauchent pas.
- **`Eglise.statut = 'suspendu'`** bloque désormais réellement la connexion de
  tous les comptes de cette église (vérifié dans `auth.controller.js`).
  Testé : suspension → login refusé → réactivation → login à nouveau possible.
- **`Utilisateur.actif = false`** bloque la connexion d'un seul compte, même
  avec le bon mot de passe (utile pour un ouvrier qui quitte l'église sans
  bloquer tout le monde). Testé de bout en bout.
- **Point de sécurité corrigé pendant le développement** : la première version
  de `listerUtilisateursSysteme` renvoyait `motDePasseHash` dans la réponse
  JSON (fuite de données sensibles). Corrigé avec `attributes: { exclude:
  ['motDePasseHash'] }`. Si tu ajoutes une nouvelle route qui liste des
  `Utilisateur`, pense à exclure ce champ.
- Le journal d'activité (`JournalActivite`) est volontairement simple — il ne
  couvre que quelques actions clés (création d'église, changement de statut,
  archivage de courrier, réinitialisation de mot de passe, blocage/déblocage,
  modération d'annonce), pas un audit exhaustif de toutes les actions du
  système.

## Planning — logique clé

- La récurrence trimestrielle (`recurrence: "trimestrielle"`) génère **4 occurrences réelles**
  en base (l'événement initial + 3 occurrences à +3, +6 et +9 mois), reliées par un `serieId`
  commun. Ce n'est pas une récurrence "virtuelle" calculée à la volée : chaque occurrence
  est une ligne indépendante, ce qui permet de la modifier/supprimer individuellement.
- Le trimestre (`T1`–`T4`) est calculé à la volée à partir du mois de la date
  (`Math.ceil(mois / 3)`), jamais stocké en base.
- **Important — limite assumée du système de rappel** : `rappelDate` déclenche un
  affichage **dans l'application** (bandeau sur le tableau de bord, via
  `GET /evenements/rappels`) — il n'y a **aucun envoi de SMS ou d'e-mail automatique**.
  C'est documenté comme hors périmètre actuel dans le cahier des charges. Un
  rappel ne "notifie" personne qui n'a pas l'application ouverte ou n'y retourne pas.

## Ressources Humaines — logique clé

- Un membre (`Membre`) peut recevoir un compte de connexion via `POST /membres/:id/compte`
  — cela crée un `Utilisateur` avec le rôle `ouvrier` et le lie via `Membre.utilisateurId`.
- Les routes `/mon-espace/*` résolvent le membre connecté via
  `Membre.findOne({ where: { utilisateurId: req.auth.sub } })` — **si ce lien
  est cassé (compte supprimé, membre supprimé), ces routes renvoient 404**.
- Un département a un `chefMembreId` (référence un `Membre`) et une relation
  many-to-many `ouvriers` via la table de jonction `DepartementMembre`.
- Une absence de ligne `PresenceCulte` pour un couple (culte, membre) signifie
  "sans réponse" — ce n'est PAS stocké explicitement, c'est déduit côté
  contrôleur (`presencesDuCulte`).

Toutes les routes protégées attendent l'en-tête `Authorization: Bearer <token>`.

## Module Correspondance — logique clé

- Une correspondance **physique** nécessite l'upload d'un fichier (`document`, image ou PDF, 8 Mo max).
- Une correspondance **numérique** envoyée à une `destinataireEgliseId` du système
  crée automatiquement **deux enregistrements liés** (`correspondanceLieeId`) :
  une copie "sortante" chez l'expéditeur, une copie "entrante" chez le destinataire.
- `dateLimiteTraitement` = `dateReception` + **8 jours**, calculé à la création.
  Le champ `enRetard` (calculé à la volée dans la réponse API) indique un
  dépassement de ce délai pour toute correspondance non encore archivée.
- `POST /:id/accuse` ne fonctionne que sur une correspondance **entrante** et
  propage automatiquement l'accusé sur la copie liée côté expéditeur.
- Les fichiers uploadés sont servis statiquement depuis `/uploads/*`
  (dossier `UPLOAD_DIR`, non versionné — à migrer vers un stockage objet
  en production, voir cahier des charges).

## Module Annonces — exception à l'isolation multi-tenant

`GET /api/annonces` est **volontairement non filtré par `egliseId`** : c'est
un mur commun à toutes les églises du système, documenté explicitement dans
le cahier des charges (§3.2). Ne pas "corriger" ce comportement en ajoutant
un filtre tenant — ce serait un bug qui casserait la fonctionnalité.

## Note — champs "Autre" en texte libre

Deux formulaires proposent une option "Autre" côté frontend : le type d'entrée
financière et le type de culte. Dans les deux cas, **le texte tapé par
l'utilisateur est envoyé directement comme valeur du champ** (`type`), pas le
mot littéral "Autre" — c'est pourquoi `Entree.type` est un `STRING` libre et
non un `ENUM` (changé exprès pendant la Phase 12, avant cette évolution le
champ était contraint à 4 valeurs fixes). `Culte.type` était déjà en `STRING`
libre depuis le début.

## Sécurité multi-tenant

Le middleware `src/middlewares/tenantScope.js` extrait l'`egliseId` du token
JWT et l'attache à `req.egliseId`. **Tous les contrôleurs filtrent leurs
requêtes Sequelize avec `where: { egliseId: req.egliseId }`** — c'est ce qui
garantit qu'une église ne peut jamais voir les données d'une autre.

Si tu ajoutes un nouveau modèle/contrôleur, respecte impérativement ce
pattern.

## Nouvelles routes (31/08) — Logistique, Communautés, Notifications

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/api/materiel` | église | Inventaire du matériel (nom, catégorie, quantité, état, seuil d'alerte) |
| GET | `/api/notifications` | église | Agrège courriers en retard + rappels actifs, pour la cloche du TopBar |
| POST | `/api/super-admin/eglises` | Super Admin | **Créer une église directement**, sans passer par l'inscription publique |
| GET/POST | `/api/super-admin/communautes` | Super Admin | Lister / créer une communauté (dénomination) |
| PATCH | `/api/super-admin/eglises/:id/communaute` | Super Admin | Rattacher (ou détacher) une église à une communauté |
| POST | `/api/super-admin/communautes/:id/compte` | Super Admin | Créer le compte de connexion d'une communauté |
| GET | `/api/communaute/dashboard` | communauté | Statistiques : nb églises, total dû/payé, taux de recouvrement |
| GET | `/api/communaute/eglises` | communauté | Liste des églises rattachées (lecture seule) |
| GET | `/api/communaute/eglises/:id/finances` | communauté | Bilan financier d'une église rattachée (lecture seule) |
| GET/POST | `/api/communaute/cotisations` | communauté | Configurer montant + fréquence de cotisation par église |
| POST | `/api/communaute/cotisations/:egliseId/generer-echeances` | communauté | Génère les échéances de l'année en cours |
| GET | `/api/communaute/echeances` | communauté | Liste des échéances (filtre `?egliseId=`) |
| POST | `/api/communaute/versements` | communauté | Enregistre un paiement, avec affectation automatique |
| GET | `/api/communaute/recouvrement` | communauté | Églises triées par montant en retard (les plus urgentes en premier) |

## Espace Communauté — logique clé (nouveau, 31/08)

**Le vrai problème résolu : le recouvrement.** Une communauté (ex: la CADEC)
regroupe plusieurs églises et a besoin de savoir qui a payé sa cotisation.

- **Connexion via la même page que les églises** (`/api/auth/login`), pas une
  page séparée comme le Super Admin. Le token JWT porte `role: 'communaute'`
  et `communauteId` au lieu d'`egliseId` — c'est le même contrôleur `login()`
  qui bifurque selon le rôle de l'utilisateur trouvé.
- **`communauteScope` middleware** (équivalent de `tenantScope` mais pour les
  communautés) extrait `communauteId` du token et l'attache à `req.communauteId`.
  Toutes les requêtes du contrôleur `communaute.controller.js` filtrent par
  ce champ — même logique de sécurité que le multi-tenant des églises.
- **Lecture seule stricte** : les routes communauté ne permettent JAMAIS de
  modifier les données d'une église (pas de `POST`/`PUT` sur les entrées,
  charges, membres, etc. d'une église depuis l'espace communauté).
- **Affectation automatique des versements** (`enregistrerVersement`) : si
  aucune `echeanceId` n'est précisée, le montant comble les échéances impayées
  de la plus ancienne à la plus récente, jusqu'à épuisement — testé avec un
  versement de 120 000 FC réparti exactement sur 3 échéances de 50 000 FC
  (Jan + Fév + 20 000 sur Mars).
- **`GET /communaute/recouvrement`** trie les églises par `restant` décroissant
  — c'est l'écran de travail principal d'une communauté, pas juste une liste.

## Logistique — recadrage volontaire (31/08)

Le module a été **volontairement réduit à l'inventaire seul** (nom, catégorie,
quantité, état, seuil d'alerte → `stockFaible` calculé à la volée). Le prêt de
matériel à un culte/département et l'historique de sortie, initialement prévus,
ont été retirés du périmètre à la demande explicite — à reconsidérer plus tard
si le besoin réapparaît.

## Passer à PostgreSQL (production)

Le projet utilise SQLite pour simplifier le développement. Pour la
production, remplace `src/config/database.js` par une connexion PostgreSQL
(ex: via Northflank, Neon, Supabase) :

```js
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
})
```

Et remplace la dépendance `sqlite3` par `pg` dans `package.json`.

## Déploiement (Northflank)

1. Pousse ce dossier `backend/` comme service Git sur Northflank.
2. Ajoute les variables d'environnement (`JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`
   pointant vers l'URL de ton frontend Vercel).
3. Commande de démarrage : `npm start`.
4. Lance `npm run seed` une fois (via un job ponctuel) pour créer la première
   église de démonstration, ou utilise directement `/api/auth/eglises` pour
   inscrire de vraies églises.

## À faire avant une vraie mise en production

- Remplacer `motDePasseProvisoire` renvoyé dans la réponse HTTP par un vrai
  envoi d'e-mail (ex: Resend, SendGrid) — ne jamais exposer un mot de passe
  dans une réponse API en production.
- Ajouter la validation des entrées (ex: `zod` ou `express-validator`).
- Ajouter des migrations Sequelize plutôt que `sequelize.sync()`.
- Ajouter un endpoint de changement de mot de passe.
