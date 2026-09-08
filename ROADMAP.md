# Roadmap — ChurchApp

> Ce document explique, en langage simple, ce que l'application sait déjà faire et ce qu'elle saura faire dans le prochain mois. Il est mis à jour à chaque étape terminée.

Légende : ✅ Fait et disponible  ·  🔄 En cours  ·  ⬜ À faire

---

## ⏳ À faire en priorité — Les 5 petites corrections à faire en premier

> Ce sont les finitions à régler avant de continuer. Elles passent avant tout le reste.

- ✅ **Page de connexion plus accueillante** : photo d'église en fond à gauche de l'écran de connexion, avec dégradé pour garder le texte lisible.
- ✅ **Infos de l'église mieux placées** : nom de l'église et bouton "Se déconnecter" tout en haut du menu de gauche, visibles dès l'ouverture.
- ✅ **Bouton "Exporter en PDF" qui marche vraiment** : génère un vrai fichier PDF téléchargeable du bilan du mois choisi (testé, PDF valide vérifié visuellement).
- ✅ **Scanner un document directement** : bouton "Scanner" qui ouvre la caméra du téléphone/ordinateur, permet de cadrer le document, de reprendre la photo si besoin, puis de la valider — sans passer par un fichier externe. Disponible pour le courrier physique et la pièce jointe d'un courrier numérique.
- ✅ **Voir clairement les courriers envoyés (colonne "Sortie")** : nouvel onglet "Sortie" dans Correspondance, qui montre tous les courriers envoyés et s'ils ont été reçus (accusé) ou non.

**→ Les 5 corrections prioritaires sont terminées.**

---

## 🎨 Système de design officiel (nouveau, 29/08)

Un kit de design complet ("Sacred Assembly") a été fourni et intégré comme référence visuelle pour toute la suite du projet — y compris les maquettes des futurs modules (Ressources Humaines, Planning/Logistique, Super Admin).

- ✅ Kit sauvegardé dans le projet (`docs/design-kit/`) : palette, typographie, et une maquette par page
- ✅ Police "archive" (IBM Plex Mono) appliquée partout où il y a des chiffres, des dates, des badges et des en-têtes de tableau
- ✅ Cartes de statistiques affinées (icônes en cercle, libellés en capitales)
- ✅ Nouveau pied de page signature sur toutes les pages
- Les maquettes des 3 prochains modules (RH, Planning, Super Admin) serviront de base visuelle directe quand on les construira, pour aller plus vite

---

## Phase 0 — Les fondations (déjà fait)

Ce qui permet à l'application de fonctionner pour plusieurs églises en même temps, en toute sécurité.

- ✅ Chaque église a son espace séparé : les données d'une église ne sont jamais visibles par une autre
- ✅ Connexion sécurisée avec identifiant et mot de passe (pasteur / administrateur)
- ✅ Gestion de base : églises, utilisateurs, membres, cultes, finances (entrées et dépenses)
- ✅ Application qui marche sur téléphone et ordinateur, avec le design ChurchApp

## Phase 1 — Finances (déjà fait)

- ✅ Enregistrer les entrées d'argent : offrandes, dîmes, dons spéciaux — **ou un type tapé librement** si aucune catégorie ne correspond ("Autre" ouvre un champ texte)
- ✅ Enregistrer les dépenses par catégorie
- ✅ Voir automatiquement le bilan du mois (combien est entré, combien est sorti, le solde)
- ✅ Télécharger ce bilan en vrai fichier PDF (mois par mois)
- ✅ **Rapport annuel complet en PDF** : un seul document qui reprend tout ce qui concerne l'église sur toute une année : le bilan financier mois par mois, la fréquentation des cultes, un résumé du courrier (reçus/envoyés/archivés/en retard) et un résumé des annonces. Sélecteur d'année sur la page Rapports, testé avec des données réelles et une année vide.

## Phase 2 — Présence aux cultes (déjà fait)

- ✅ Enregistrer chaque culte : combien de personnes en salle + en ligne, avec un type de culte modifiable en texte libre ("Autre")
- ✅ **Prédicateur choisi dans une liste classée par département** (plutôt que retapé à chaque fois), avec repli en saisie libre pour un prédicateur invité pas encore enregistré
- ✅ Voir un graphique qui montre si la fréquentation monte ou baisse
- ✅ Annuaire : liste de tous les membres de l'église

## Phase 3 — Confort d'utilisation (déjà fait)

- ✅ Tableau de bord qui résume tout en un coup d'œil
- ✅ Inscription d'une nouvelle église en 3 étapes simples
- ✅ Menu qui s'adapte bien sur téléphone
- ✅ Petits messages de confirmation ("Enregistré avec succès")
- ✅ Tableaux avec pages (1, 2, 3...) pour ne pas tout afficher d'un coup

## Phase 4 — Courrier entre églises (déjà fait)

C'est le module qui gère les lettres et documents.

- ✅ On peut envoyer un courrier papier scanné (fichier ou caméra directe)
- ✅ On peut envoyer un courrier numérique directement à une autre église qui utilise ChurchApp
- ✅ L'autre église peut confirmer qu'elle a bien reçu ("accusé de réception")
- ✅ Chaque courrier a un délai de 8 jours : s'il dépasse, il s'affiche en rouge "En retard"
- ✅ On peut archiver un courrier quand il est traité
- ✅ Onglet "Sortie" bien visible pour retrouver tous les courriers envoyés et leur statut de réception
- ✅ Tout a été testé : un courrier envoyé par l'Église A arrive bien chez l'Église B, avec accusé de réception et alerte de retard

## Phase 5 — Annonces entre églises (déjà fait)

C'est le petit "mur d'annonces" partagé entre toutes les églises.

- ✅ Une église publie une annonce (titre + texte + photo si besoin)
- ✅ Toutes les autres églises la voient instantanément
- ✅ Testé : une annonce publiée par l'Église A est bien visible par l'Église B

## Phase 6 — Mettre l'application en ligne (à faire à la fin du mois)

- ⬜ Mettre la partie qui gère les données en ligne (serveur)
- ⬜ Mettre la partie visible par les utilisateurs en ligne (site web)
- ⬜ Configurer les accès sécurisés pour la vraie utilisation

## Phase 7 — Améliorations pour plus tard (pas urgent)

- ⬜ Envoyer les identifiants par vrai e-mail automatique
- ⬜ Mieux vérifier que les informations tapées sont correctes
- ⬜ Rendre l'application encore plus accessible pour tous

---

## Phase 8 — 7 améliorations utiles au quotidien (à faire après les 5 corrections)

> Ces idées viennent de l'analyse du 26/08/2026. Elles rendent l'application plus pratique chaque jour.

- ⬜ **Retrouver facilement ses finances** : pouvoir filtrer par mois, année, type (dîme/offrande) et chercher par mot-clé. Exemple : "voir toutes les offrandes de mars".
- ⬜ **Retrouver facilement un courrier** : barre de recherche + filtres : "courriers reçus / envoyés", "papier / numérique", et un bouton pour imprimer la liste.
- ⬜ **Alertes sur le tableau de bord** : 3 petites cartes d'alerte en haut : "2 courriers en retard", "Solde du mois négatif", "Nouvelle annonce publiée" — on clique et on arrive directement au bon endroit.
- ✅ **Petits badges rouges de notification** : un vrai chiffre rouge sur la cloche du menu, calculé à partir des courriers en retard et des rappels actifs — testé, cliquer ouvre la liste avec des liens directs.
- ⬜ **Annonces plus complètes** : pouvoir corriger ou supprimer sa propre annonce, filtrer par église qui l'a publiée.
- ⬜ **Meilleurs rapports** : choisir une année, comparer "cette année vs l'année dernière" avec des graphiques, et exporter aussi en Excel.
- ✅ **Une seule barre de recherche pour tout** : déjà en place en haut de l'écran (elle existait déjà avant cette vérification du 31/08).

---

## Phase 9 — Ressources Humaines : mieux organiser les personnes (nouveau)

> Aujourd'hui on a juste une liste de "Membres". Demain cette partie s'appellera "Ressources Humaines" et permettra de gérer les départements et les ouvriers. C'est la grosse nouveauté du mois.

- ✅ **Le menu "Membres" devient "Ressources Humaines"** : dedans, deux onglets simples : 1) "Membres" (la liste actuelle) et 2) "Départements"
- ✅ **Créer des départements** : par exemple "Chorale", "Intercession", "Protocole", "Jeunesse". Pour chaque département, on écrit son nom et sa description.
- ✅ **Nommer un chef et ajouter des ouvriers** : quand on crée un département, on choisit qui en est le chef (parmi les membres) et on coche les personnes qui en font partie. On les appelle les "ouvriers" du département.
- ✅ **Chaque ouvrier aura son propre accès** : bouton "Donner un accès" sur la fiche d'un membre — crée un compte de connexion avec des droits limités (il ne voit que son espace personnel, pas les finances ni le reste).
- ✅ **L'ouvrier signe sa présence lui-même** : un espace dédié ("Mon espace") liste ses cultes et propose "Présent" ou "Absent + raison". Testé de bout en bout : compte créé, connexion, signature de présence.
- ✅ **L'administrateur voit tout en un tableau** : bouton "Détail" sur chaque culte, ouvre un tableau avec le statut de chaque membre (présent / absent + raison / sans réponse), filtrable par département.

**Tout testé de bout en bout** (backend) : création d'un département avec chef et ouvriers, création d'un compte ouvrier, connexion de l'ouvrier, signature de présence, et vérification que l'administrateur voit bien le bon statut.

**Exemple concret :** Le pasteur crée "Culte du 15 septembre". Les 12 ouvriers de la chorale reçoivent la notification, 10 cliquent sur "Présent", 2 sur "Absent - voyage". Le pasteur le voit instantanément.

## Phase 10 — Planning trimestriel avec rappel automatique (fait)

> Un agenda pour prévoir les activités 3 mois à l'avance, sans rien oublier grâce aux alarmes.

- ✅ **Créer un événement en 30 secondes** : date, titre, description, et responsable choisi parmi les membres (ou tapé librement si la personne n'est pas encore enregistrée).
- ✅ **Rappel si on veut** — MAIS avec une limite importante à connaître : le rappel s'affiche **dans l'application** (un bandeau en haut du tableau de bord), il n'envoie **pas** de SMS ou d'e-mail. Pour que Papa Jean voie son rappel, il doit se connecter à ChurchApp — ce n'est pas encore une vraie notification automatique sur son téléphone. C'est documenté dans le cahier des charges comme une amélioration future (nécessite un service de SMS/e-mail).
- ✅ **Voir par trimestre** : vue "Liste" avec onglets T1/T2/T3/T4, et vue "Calendrier" (mois par mois, avec les jours ayant un événement marqués d'un point). On peut aussi cocher "Répéter tous les trimestres" à la création, ce qui crée automatiquement 4 occurrences sur un an.
- ✅ **Tout remonte sur le tableau de bord** : un widget "Les 7 prochains jours" et un bandeau des rappels actifs apparaissent en haut du tableau de bord.

**Tout testé de bout en bout** (backend) : création d'un événement simple avec rappel, création d'un événement récurrent (4 occurrences générées avec les bonnes dates), widget des 7 prochains jours, et détection des rappels actifs.

**Exemple concret réel :** "Nettoyage général du temple - 10 octobre - Responsable : Papa Jean - Rappel : veille à 17h" → le rappel apparaîtra sur le tableau de bord de l'église à partir de la veille 17h, visible par quiconque se connecte (pasteur, administrateur).

## Phase 11 — Logistique : inventaire du matériel (recadré, plus simple)

> Recadrage du 31/08 : on se limite à l'inventaire (savoir ce qu'on a et son état). Le prêt/affectation à un culte et l'historique de sortie sont retirés du périmètre pour l'instant — trop complexe pour la valeur immédiate, à reconsidérer plus tard si besoin.

- ✅ **Faire l'inventaire** : enregistrer tout le matériel : chaises, sono, micros, instruments, bâches, etc. Pour chaque objet : son nom, sa catégorie, sa quantité, son état (bon / moyen / mauvais).
- ✅ **Voir en un coup d'œil s'il manque quelque chose** : si le stock d'un matériel devient faible (en dessous d'un seuil qu'on définit), il s'affiche en rouge.
- ✅ **Page simple et claire** : un tableau avec tout le matériel, testé avec un vrai ajout ("Chaises", quantité 3, seuil 10 → bien signalé en stock faible).

**Exemple concret :** L'admin voit "Chaises : 80, état bon" et "Micros : 4, état moyen — stock faible" d'un seul coup d'œil.

## Phase 12 — Espace Super Administrateur : gérer tout le système (fait, + nouveauté)

> Un espace à part, réservé uniquement à vous (l'équipe qui gère ChurchApp). Les pasteurs, admins d'église et ouvriers ne le voient jamais. Il sert à piloter toutes les églises depuis un seul endroit, côté serveur.

- ✅ **2 pages de connexion séparées (même design)** : `/` pour les églises et `/super-admin` réservée à vous — même identité visuelle (photo à gauche), mais deux sessions **totalement indépendantes** dans le navigateur (impossible de mélanger une connexion église et une connexion Super Admin).
- ✅ **Tableau de bord système** : nombre d'églises (actives/suspendues), nombre total de membres, annonces publiées, courriers en retard dans tout le système.
- ✅ **Gérer les églises** : recherche, suspension/réactivation, suppression. **Testé et confirmé : suspendre une église bloque immédiatement la connexion de tous ses comptes**, et la réactivation la débloque.
- ✅ **Gérer les utilisateurs** : liste de tous les pasteurs/admins/ouvriers avec leur église, réinitialisation de mot de passe en un clic, blocage/déblocage d'un compte précis. **Testé : un compte bloqué ne peut plus se connecter, même avec le bon mot de passe.**
- ✅ **Modérer les annonces** : voir et retirer n'importe quelle annonce du mur partagé.
- ✅ **Journal d'activité** : trace des actions clés (création d'église, suspension, archivage de courrier, réinitialisation de mot de passe, blocage, modération d'annonce) — testé, les entrées apparaissent bien après chaque action.
- ⬜ **Paramètres du système** (délai des 8 jours modifiable, message d'accueil) — pas encore fait, reporté avec la Phase 7 (pas urgent).
- ✅ **Créer une église directement depuis le Super Admin** — bouton "Créer une église" sur la page Églises, avec le même formulaire (église + pasteur + administrateur) que l'inscription publique. Testé de bout en bout.

**Un bug de sécurité trouvé et corrigé pendant les tests :** la liste des utilisateurs renvoyait par erreur le mot de passe chiffré de chaque compte dans la réponse technique. Corrigé avant livraison — ce champ est maintenant explicitement exclu de toutes les réponses.

**Exemple concret réel testé :** Une église "bloquée" (compte pasteur2@demo.cd) → tentative de connexion avec le mot de passe correct → refusée avec le message "Ce compte a été bloqué. Contactez le support ChurchApp."

---

## Phase 13 — Communautés d'églises et Recouvrement des cotisations (nouveau, 31/08)

> Nouveauté demandée le 31/08. Beaucoup d'églises appartiennent à une communauté/dénomination plus large (ex: la CADEC), qui a besoin de voir la santé de "ses" églises et de suivre les cotisations qu'elles versent.

### 13.1 Espace Communauté

- ✅ **Une communauté regroupe plusieurs églises** : le Super Admin crée la communauté et rattache les églises existantes à elle. Testé.
- ✅ **Connexion par la même page que tout le monde** : un compte Communauté se connecte sur la page normale `/` — l'application le redirige automatiquement vers `/communaute/dashboard`, comme elle le fait déjà pour un ouvrier vers "Mon espace".
- ✅ **Voir ses églises** : nombre d'églises rattachées, liste avec un aperçu de chacune.
- ✅ **Voir la situation financière de ses églises** : la communauté peut consulter (lecture seule) le bilan financier de chaque église sous son aile — testé qu'aucune modification n'est possible depuis cet espace.

### 13.2 Recouvrement des cotisations — la vraie priorité

C'est le problème concret que les communautés rencontrent : savoir qui a payé sa cotisation et qui est en retard.

- ✅ **Configurer une cotisation par église** : un montant + une fréquence (mensuelle / trimestrielle / annuelle).
- ✅ **Le système génère automatiquement les échéances** : testé — 12 échéances mensuelles générées d'un coup pour une église.
- ✅ **Enregistrer un versement** : testé avec un versement de 120 000 FC sans préciser d'échéance → réparti automatiquement sur les 3 plus anciennes échéances impayées (2 mois complets + le 3ème partiellement), exactement comme prévu.
- ✅ **Tableau de recouvrement** : la liste des églises triée par montant en retard, avec taux de recouvrement global affiché.
- ✅ **Statut par église** : à jour / en retard / partiellement payé.
- ✅ **Sécurité vérifiée** : un compte Communauté ne peut pas accéder aux finances d'une église (refusé), et un compte église ne peut pas accéder à l'espace Communauté (refusé aussi).

**Exemple réel testé :** Communauté "CADEC" créée, 2 églises rattachées, cotisation de 50 000 FC/mois configurée pour l'une d'elles, 12 échéances générées, versement de 120 000 FC réparti automatiquement sur Janvier + Février + une partie de Mars.

---

## 📅 Planning sur 1 mois — Du 27 Août au 27 Septembre 2026

> Comment on va tout faire, étape par étape, sans se presser. Livraison finale le 27 septembre.

| Quand ? | On fait quoi ? | Ce que vous verrez à la fin de l'étape |
| :--- | :--- | :--- |
| **28 au 30 Août (3 jours)** | **On finit les 5 corrections** | ✅ Fait : la connexion est plus belle, le menu est plus clair, le PDF se télécharge, on peut scanner avec la caméra, et l'onglet "Sortie" est visible. |
| **31 Août au 06 Sept (1 semaine)** | **On crée les Départements** | Le menu "Ressources Humaines" apparaît. Vous pouvez créer "Chorale", "Jeunesse", etc., nommer un chef et ajouter les ouvriers. |
| **07 au 13 Sept (1 semaine)** | **On donne la main aux ouvriers** | Chaque ouvrier peut se connecter et signer "Présent / Absent" pour chaque culte. Le pasteur voit le tableau des présences par culte. |
| **14 au 19 Sept (6 jours)** | **On ajoute le Planning + le stock de matériel** | Vous pouvez créer un planning avec rappel automatique, voir le calendrier par trimestre, et commencer à lister tout le matériel de l'église. |
| **20 au 27 Sept (1 semaine)** | **On branche tout ensemble + Espace Super Admin + mise en ligne** | Le matériel peut être prêté à un culte, tout est lié, **votre espace Super Admin est prêt pour piloter le système**, on teste avec de vraies églises, et on met l'application en ligne pour tout le monde. |

**Les 5 dates à retenir :**

- 30/08 : ✅ Les 5 corrections sont terminées
- 06/09 : Vous pouvez créer vos départements
- 13/09 : Les ouvriers peuvent signer leur présence depuis leur téléphone
- 19/09 : Le planning avec alarmes et l'inventaire matériel sont prêts
- 27/09 : **Tout est livré, votre espace Super Admin est opérationnel et l'application est en ligne**

> **Note du 27/08 :** L'espace Super Admin est démarré dès aujourd'hui en parallèle (maquette le 28/08, finalisation avec le reste le 27/09).

---

**Dernière mise à jour :** 31/08/2026 (2) — Grosse livraison : Logistique recadrée à l'inventaire seul (fait), Super Admin peut créer des églises directement (fait), recherche globale et notifications vérifiées/rendues fonctionnelles, et **nouveau module Communautés + Recouvrement des cotisations** (Phase 13, entièrement fait et testé — c'est la plus grosse nouveauté du jour, avec l'affectation automatique des versements aux échéances impayées). Il ne reste que les Paramètres système (Phase 12) et les points non urgents des Phases 7/8. // 31/08/2026 — Deux améliorations de confort ajoutées : (1) l'option "Autre" dans les formulaires (type d'entrée financière, type de culte) permet maintenant de taper un texte libre au lieu de rester bloqué sur le mot "Autre" ; (2) le prédicateur d'un culte se choisit désormais dans une liste classée par département, avec repli en saisie libre si besoin. Documents ROADMAP et CAHIER DES CHARGES synchronisés : RH/Ouvrier et Super Admin sont passés de "à venir" à "fait" partout. // 29/08/2026 (3) — Rapport annuel complet en PDF terminé et testé (finances par mois, présence, courrier, annonces) — corrigé un bug d'alignement de texte au passage. // 29/08/2026 (2) — Ajout d'une tâche : rapport annuel complet en PDF, à livrer avant le 30/08 sans décaler le 27/09. // 29/08/2026 — Les 5 corrections prioritaires sont terminées : photo de connexion, menu réorganisé, export PDF réel (testé), scan caméra (courrier physique + pièce jointe numérique), onglet "Sortie". // 27/08/2026 (6) — Précision Phase 12 : 2 pages de connexion séparées (même design) : /login pour églises et /super-admin cachée pour vous // 27/08/2026 (5) — Ajout Phase 12 : Espace Super Administrateur // 27/08/2026 (4) — Version simplifiée pour non-techniciens.
