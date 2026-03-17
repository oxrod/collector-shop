## 1. Présentation de l’entreprise

**Collector** est une start-up française créée il y a 5 ans.

### Activité historique

- Organisation de salons d’objets de collection « du quotidien »
- Partenariats avec :
  - Mairies
  - Acteurs locaux (magasins spécialisés, friperies, etc.)
  - Collectionneurs particuliers

### Types d’objets concernés

- Baskets en édition limitée
- Posters dédicacés
- Figurines originales (ex : Hasbro Star Wars)
- Cassettes V2000
- Objets vintage rares ou uniques

⚠️ Le segment **exclut** :

- Les objets de luxe
- La brocante classique

### Direction

- 2 dirigeant(e)s
- Experts en événementiel
- Passionné(e)s d’objets vintage
- Anciennement chefs de projet IT en ESN

---

## 2. Organisation actuelle

### Équipe

**Fonctions métier :**

- Responsable administratif & RH
- Responsable communication & marketing (spécialiste marketing digital)

**Équipe IT (récemment constituée) :**

- 1 Lead Developer
- 2 Développeurs confirmés (5 ans d’expérience)
- Recrutements prévus

---

## 3. Environnement technique actuel

- Postes : Windows 11 + 1 Mac (graphisme)
- Suite : Office 365 Business Standard
- BI : Power BI
- Messagerie : Exchange
- Création graphique : Adobe Creative Cloud
- Hébergement actuel : WordPress chez un fournisseur français
- Accès internet : Wi-Fi incubateur
- Infrastructure IT limitée (à structurer)

---

# 4. Projet : Collector.shop

## Objectif

Développer une **application web de vente d’objets de collection entre particuliers**.

Modèle économique :

- Commission de **5 % par transaction**

---

# 5. Profils utilisateurs

## 1. Acheteur

## 2. Vendeur

(Un utilisateur peut être les deux)

## 3. Admin (Back-office)

---

# 6. Fonctionnalités principales (V1)

## Authentification

- Inscription obligatoire pour acheter ou vendre
- Consultation catalogue possible sans compte

---

## Espace utilisateur

Chaque utilisateur authentifié dispose :

- Suivi des achats/ventes en cours
- Historique
- Système de notation
- Gestion des notifications
- Paramétrage des centres d’intérêt
- Chat acheteur ↔ vendeur

---

## Chat intégré

- Accessible depuis espace personnel
- Modération possible par admin
- Interdiction d’échanger :
  - Email
  - Numéro de téléphone
  - Informations personnelles

---

## Système de recommandations

- Basé sur les centres d’intérêt (V1)
- V2 : intégration du comportement de navigation

---

## Notifications

Types :

- Nouvel article correspondant à un centre d’intérêt
- Mise en ligne d’un article spécifique
- Variation de prix

Canaux :

- Espace utilisateur
- Email

Paramétrables par l’utilisateur.

---

## Gestion des articles

Chaque article doit inclure :

- Photos obligatoires
- Description précise
- Prix
- Frais de port

Processus :

- Validation obligatoire avant mise en ligne
- Automatisation maximale du contrôle

Variation de prix :

- Historique conservé
- Notification aux acheteurs intéressés
- Transmission au module antifraude

---

## Paiement

- Paiement uniquement via la plateforme
- CB uniquement (V1)
- Interdiction de paiement direct entre utilisateurs
- Garantie qualité vendeur assurée par Collector

---

## Vendeurs

- Possibilité de créer plusieurs boutiques virtuelles
- Identification obligatoire en tant que vendeur particulier

---

# 7. Back Office

Fonctions admin :

- Création catégories
- Suppression articles
- Suppression vendeurs non conformes
- Modération chat
- Réception alertes antifraude

---

# 8. Exigences techniques majeures

## Sécurité (priorité critique)

- Application financière
- Protection données personnelles
- Lutte contre fraude
- Prévention échange données privées
- Journalisation variations de prix

---

## Détection de fraude

La V1 doit permettre :

- Intégration d’un outil antifraude
- Outil interne ou solution externe
- Détection :
  - Prix anormalement élevé
  - Vendeur suspect
  - Comportement anormal

---

## Internationalisation

- Support multilingue
- Support international

---

## Accessibilité

- Respect standards d’accessibilité web

---

## Publicité

- Capacité d’automatiser l’intégration de publicités ciblées
- Intégration avec sites partenaires

---

# 9. Exigences d’architecture

L’architecture doit être :

- Modulaire
- Évolutive
- Facilement extensible
- Orientée ajout rapide de fonctionnalités

Exemples d’évolutions envisagées :

- Système d’enchères
- Vente en live streaming
- Bot service avant-vente
- Module d’analyse des ventes
- Outils décisionnels direction

---

# 10. Contraintes stratégiques

- Startup en croissance
- Ressources IT limitées
- Besoin d’automatisation maximale
- Forte exigence sécurité
- Time-to-market important
- Capacité d’adaptation rapide au marché

---

# 11. Objectif global du projet

Concevoir une plateforme :

- Sécurisée
- Évolutive
- Automatisée
- Centrée utilisateur
- Adaptée au marché des objets de collection non luxueux
- Prête à évoluer vers un modèle plus riche (enchères, live, IA, data)

---

# 12. Positionnement métier

Collector.shop se positionne comme :

> Une plateforme spécialisée dans les objets de collection « émotionnels » et du quotidien, sécurisée, communautaire et orientée confiance.
