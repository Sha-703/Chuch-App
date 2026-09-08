# Cahier des charges — ChurchApp (version simple)

> **C'est quoi un Cahier des Charges ?** C'est la liste claire de tout ce que l'application doit savoir faire. Comme le plan d'une maison : il dit combien de pièces il faut et à quoi elles servent, avant de commencer à construire.
>
> **Dernière mise à jour : 31/08/2026** — Les modules Ressources Humaines (départements + ouvriers), Planning trimestriel et Espace Super Administrateur sont maintenant **terminés et testés** : ils passent de "à venir" à "déjà fait". Seule la Logistique (matériel) reste à construire.

---

## 1. C'est quoi ChurchApp ?

ChurchApp est une application pour les églises de la RDC. Elle sert à 3 choses principales :

1. **Gérer l'argent en toute transparence** (combien est entré, combien est sorti)
2. **Suivre qui vient aux cultes** (présence en salle et en ligne)
3. **Gérer les papiers et la communication entre églises** (courriers et annonces)

**Règle la plus importante :** Chaque église a son propre espace privé. L'Église A ne voit jamais les finances ou les membres de l'Église B. Seules les annonces sont partagées entre toutes, exprès.

Chaque église a 2 comptes au départ : le **pasteur** (qui supervise) et l'**administrateur** (qui saisit au quotidien). Depuis peu, une église peut aussi donner un accès limité à des **ouvriers** (voir §2.7), et l'équipe ChurchApp dispose d'un **Espace Super Administrateur** séparé pour piloter tout le système (voir §2.9).

---

## 2. Ce qui marche déjà aujourd'hui

### 2.1 Se connecter et s'inscrire

- On se connecte avec un e-mail et un mot de passe.
- Une nouvelle église s'inscrit en 3 étapes simples : infos de l'église → infos du pasteur → infos de l'administrateur.
- Tout est sécurisé, chaque église ne voit que ses données.
- Après connexion, la personne est envoyée automatiquement au bon endroit : le pasteur/administrateur va sur le tableau de bord complet, un ouvrier va directement sur son espace simplifié (§2.7).

### 2.2 Gérer l'argent (Finances)

- On enregistre les entrées : offrandes, dîmes, dons spéciaux, **ou un autre type qu'on tape soi-même** (ex. "Vente de livres") si aucune des catégories ne correspond.
- On enregistre les dépenses : par catégorie (ex: électricité, transport) avec une petite description.
- L'application calcule toute seule le bilan du mois : Entrées - Dépenses = Solde.
- On peut télécharger ce bilan en PDF, mois par mois.
- On peut aussi télécharger un **rapport annuel complet en PDF**, qui rassemble en un seul document : le bilan financier de chaque mois de l'année + le total annuel, un résumé de la fréquentation des cultes, un résumé du courrier (reçus/envoyés/archivés/en retard), et un résumé des annonces publiées cette année-là. C'est le document que le pasteur peut imprimer et présenter au conseil de l'église.

### 2.3 Gérer les cultes et les membres

- On enregistre chaque culte : date, type (avec la même possibilité de taper un type "Autre" si besoin), combien de personnes en salle et en ligne.
- **Le prédicateur se choisit dans une liste**, classée par département (ex. "Pastorat → Past. Kibambe"), plutôt que de retaper un nom à chaque fois. Si la personne n'est pas encore enregistrée comme membre (ex. un prédicateur invité), on peut basculer en saisie libre en un clic.
- On voit un graphique qui montre si plus ou moins de monde vient d'un dimanche à l'autre.
- On a la liste de tous les membres (annuaire) — voir aussi §2.7 pour l'organisation en départements.

### 2.4 Une application agréable à utiliser

- Un tableau de bord qui résume tout sur une page, avec les alertes importantes (rappels du planning, événements à venir) affichées en haut.
- Ça marche bien sur téléphone et sur ordinateur.
- Quand on enregistre quelque chose, un petit message dit "C'est enregistré !".

### 2.5 Gérer le courrier (Correspondance)

C'est comme un bureau de poste interne.

**Il y a 2 types de courriers :**

- **Courrier papier :** on a reçu une lettre papier, on la prend en photo directement avec la caméra (ou on dépose un fichier déjà scanné).
- **Courrier numérique :** on écrit directement un message dans l'application et on l'envoie à une autre église qui utilise aussi ChurchApp.

**Comment ça marche ?**

1. Un courrier arrive → il est dans **"Entrants"**.
2. On doit dire "bien reçu" (accusé de réception). Si c'est un courrier entre 2 églises ChurchApp, l'autre église voit automatiquement "Bien reçu" chez elle.
3. On le traite → il passe en **"En cours"**.
4. Quand c'est fini, on l'**archive**.

**Règle des 8 jours :** Un courrier doit être traité et archivé en 8 jours maximum. S'il dépasse, il s'affiche en rouge "En retard".

**On peut voir :** les courriers reçus, les courriers envoyés (onglet **"Sortie"**, avec leur statut de réception), et les archives.

### 2.6 Voir les annonces des autres églises

C'est un petit mur d'annonces partagé.

- Une église écrit une annonce (titre + texte + photo si on veut).
- Toutes les autres églises la voient tout de suite, de la plus récente à la plus ancienne.
- On voit toujours qui l'a publiée et quand.

### 2.7 Ressources Humaines : départements et ouvriers

Le menu "Membres" est devenu **"Ressources Humaines"**, avec deux onglets : "Membres" (l'annuaire habituel) et "Départements".

**À quoi ça sert ?** À organiser qui fait quoi dans l'église : Chorale, Protocole, Intercession, Jeunesse, etc.

**Ce qu'on peut faire, concrètement :**

- **Créer un département :** un nom ("Chorale"), une description, un **chef** choisi parmi les membres, et les personnes qui en font partie (les **"ouvriers"**, cochées dans une liste).
- **Donner un accès à un ouvrier :** un bouton "Donner un accès" sur la fiche d'un membre crée un compte de connexion avec des **droits limités** — il ne voit que son propre espace, jamais les finances, le courrier ou les autres pages.
- **L'ouvrier signe sa présence lui-même :** dès qu'il se connecte, il arrive directement sur **"Mon espace"** — une page simple qui liste les cultes et propose deux boutons : "Présent" ou "Absent" (avec une raison à préciser, ex: malade, en déplacement). Plus besoin de l'appeler un par un.
- **L'administrateur voit tout en un tableau :** sur la page "Cultes", un bouton "Détail" ouvre un tableau avec le statut de chaque personne — présent, absent (avec la raison), ou pas encore répondu — filtrable par département ("montre-moi seulement la chorale").

> **Exemple réel testé :** Un membre reçoit un accès ("ouvrier1@..."). Il se connecte, arrive sur son espace, clique "Présent" pour le culte du dimanche. Le pasteur ouvre le détail du culte et voit immédiatement son statut à jour.

### 2.8 Planning trimestriel avec rappels

Un agenda pour prévoir les activités à l'avance.

- **Créer un événement en 30 secondes :** une date, un titre, une description, un responsable choisi parmi les membres (ou tapé librement si la personne n'est pas encore enregistrée).
- **Activer un rappel si on veut :** on choisit une date et une heure de rappel. **Important à savoir :** ce rappel s'affiche dans l'application (un bandeau en haut du tableau de bord) — ce n'est pas encore un SMS ou un e-mail envoyé automatiquement sur le téléphone. Pour voir son rappel, il faut se connecter à ChurchApp.
- **Voir par trimestre :** une vue "Liste" avec des onglets T1/T2/T3/T4, ou une vue "Calendrier" (mois par mois, avec un point sur les jours qui ont un événement). On peut cocher "Répéter tous les trimestres" pour créer automatiquement 4 occurrences sur un an.
- **Tout remonte sur le tableau de bord :** un encart "Les 7 prochains jours" et les rappels actifs apparaissent en haut, dès qu'on se connecte.

> **Exemple réel testé :** "Nettoyage général du temple - 10 octobre - Responsable : Papa Jean - Rappel : veille à 17h" → le rappel apparaît bien sur le tableau de bord à partir de la veille 17h.

### 2.9 Espace Super Administrateur

> C'est un espace caché, séparé de celui des églises. Seule l'équipe ChurchApp peut y entrer, avec un compte et un mot de passe totalement différents de ceux des églises. Les pasteurs, administrateurs et ouvriers ne le voient jamais et ne peuvent jamais y accéder, même par erreur.

**À quoi ça sert ?** À piloter toutes les églises depuis un seul endroit.

**Ce qui est fait et testé :**

- **2 pages de connexion séparées, même présentation :** une pour les églises, une cachée réservée à l'équipe ChurchApp — avec la même identité visuelle (photo à gauche), mais deux "mondes" totalement étanches. Une personne peut même être connectée aux deux en même temps sur le même ordinateur sans que ça se mélange.
- **Tableau de bord système :** nombre d'églises inscrites (actives et suspendues), nombre total de membres, annonces publiées, courriers en retard dans tout le système.
- **Gérer les églises :** chercher une église, voir ses infos, **la suspendre temporairement** (plus personne dans cette église ne peut se connecter tant qu'elle est suspendue — testé et confirmé) **ou la réactiver**, ou la supprimer si besoin.
- **Gérer les utilisateurs :** voir tous les pasteurs/administrateurs/ouvriers de toutes les églises, **réinitialiser un mot de passe oublié** en un clic, ou **bloquer un compte précis** qui pose problème (testé : un compte bloqué ne peut plus se connecter, même avec le bon mot de passe).
- **Modérer les annonces :** retirer une annonce inappropriée, peu importe l'église qui l'a publiée.
- **Journal d'activité :** un historique des actions importantes ("Église X suspendue par le Super Admin", "Mot de passe réinitialisé pour untel@...") pour comprendre ce qui s'est passé en cas de souci.

> **Exemple réel testé :** Une église suspendue → un pasteur essaie de se connecter → refusé avec un message clair. L'église est réactivée → la connexion redevient possible immédiatement.

---

## 3. Ce qui reste à ajouter (Septembre 2026)

### 3.1 Logistique (gérer le matériel)

**À quoi ça sert ?** À savoir ce que l'église possède, où c'est, et si on a assez pour le prochain culte.

**Concrètement :**

- **Faire l'inventaire :** on enregistre tout : chaises, sono, micros, instruments, bâches... Pour chaque objet : son nom, sa catégorie, combien on en a au total, combien sont disponibles, et son état (bon / moyen / mauvais).
- **Savoir s'il en manque :** si le stock est faible, il s'affiche en rouge. On voit tout de suite "Chaises : 80 au total, 30 déjà prêtées, 50 disponibles".
- **Prêter du matériel à un culte ou à un département :** on dit "pour le culte du 15/09, on réserve 50 chaises et la sono au Protocole". Le stock disponible diminue tout seul. Après le culte, on le remet en stock.
- **Historique :** on voit qui a pris quoi, quand, et pourquoi. Ex: "12/09 - 2 micros sortis pour la chorale".

> **Exemple :** Avant un grand programme, l'admin voit qu'il ne reste que 50 chaises disponibles. Il sait qu'il faut en louer 30 de plus.

---

## 4. Comment c'est construit (en simple)

- Les fichiers (photos, scans) sont enregistrés de manière sécurisée. En version finale, ils seront stockés en ligne pour ne jamais se perdre.
- L'application marche sur téléphone et ordinateur, avec le même compte.
- Le compte Super Admin et les comptes d'église sont deux systèmes séparés depuis la base de données jusqu'à l'écran — ce n'est pas juste un bouton caché, c'est une vraie séparation technique.

## 5. Ce qui n'est pas prévu pour tout de suite (plus tard)

- Envoyer des notifications par e-mail ou SMS automatique (pour l'instant, les rappels et accusés de réception restent des alertes dans l'application, pas des messages envoyés sur le téléphone).
- Rendre l'application utilisable par des personnes malvoyantes (accessibilité renforcée).
- Réglages système modifiables directement par le Super Admin (ex: changer le délai des 8 jours) — pour l'instant ces réglages sont fixés dans le code.

---

**En résumé :** ChurchApp sait déjà gérer l'argent (avec rapport annuel), les cultes et leur présence individuelle, les départements et les ouvriers (avec leur propre espace de connexion), les courriers, les annonces, un planning trimestriel avec rappels, **et l'équipe ChurchApp dispose de son propre espace Super Admin pour piloter tout le système, séparé et sécurisé**. Il ne reste que le module Logistique (gestion du matériel) à construire avant la mise en ligne prévue le 27 septembre 2026.
