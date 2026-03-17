Voici une version **Markdown structurée et exploitable par une IA** comme document de référence pour piloter le projet.

---

# 📘 Référentiel Projet

## Validation Bloc : Superviser et assurer le développement des applications logicielles

---

## 🎯 Objectif de la mission

Le / la **Lead Developer** doit :

1. Structurer un processus de développement garantissant la qualité logicielle.
2. Développer une version 1 (POC) d’une application.
3. Analyser la sécurité de la V1 et proposer un plan de remédiation.
4. Présenter les résultats lors d’une soutenance (20 min + 15 min d’échange).

---

# 🧩 Compétences évaluées

## 1️⃣ Élaborer le processus d’assurance qualité logicielle

- Évaluer la qualité du développement
- Définir la politique de tests
- Définir la politique de sécurité

Référence qualité possible : ISO/IEC 25010

---

## 2️⃣ Piloter le développement et le déploiement

- Superviser une chaîne CI/CD
- Faciliter la montée en compétences
- Orchestrer la mise en production
- Garantir disponibilité et montée en charge

---

## 3️⃣ Maintenir et développer son expertise

- Expérimenter en bac à sable
- Réaliser un POC
- Développer des applications complexes

---

# 🏗️ Décomposition de la mission

---

# 🔹 PHASE 1 — Structuration du processus de développement

## 1.1 Qualité logicielle

### 🎯 Objectif

Garantir :

- Performance
- Fiabilité
- Disponibilité
- Sécurité
- Maintenabilité
- Capacité fonctionnelle

Référence : ISO/IEC 25010

---

## 1.1.1 Indicateurs qualité

### Exigence

Définir **4 métriques minimum**.

Chaque métrique doit :

- Être justifiée
- Être mesurable
- Permettre d’éviter la dette technique

### Exemples possibles

| Indicateur                 | Objectif       | Impact dette technique  |
| -------------------------- | -------------- | ----------------------- |
| Couverture de tests        | ≥ 80%          | Réduit régressions      |
| Complexité cyclomatique    | < seuil défini | Améliore maintenabilité |
| Taux d’échec pipeline      | < 5%           | Stabilise production    |
| Temps moyen de déploiement | < X min        | Optimise delivery       |

---

## 1.1.2 Cycle de vie DevSecOps

### Exigence

Formaliser un cycle intégrant la démarche DevSecOps :

- Planification
- Développement
- Tests
- Analyse sécurité
- Build
- Déploiement
- Monitoring

### Pipeline CI/CD obligatoire

Doit inclure :

- Tests unitaires
- Tests d’intégration
- Analyse statique
- Scan de vulnérabilités
- Build automatisé
- Déploiement automatisé (ou simulé)

### Schéma attendu

Décrire précisément :

- Outils
- Étapes
- Enchaînement
- Liens avec les métriques

---

## 1.1.3 Compétences & formation

### Cartographie des compétences

Exemples :

- Backend
- Frontend
- DevOps
- Sécurité
- Cloud
- Observabilité

### Action de formation

- Proposer une montée en compétence réaliste
- Pas de “profil mouton à 5 pattes”

---

# 🔹 PHASE 2 — Développement & Déploiement (POC)

---

## 2.1 Analyse des exigences

### Reformulation des exigences fonctionnelles

- Décrire clairement la fonctionnalité métier
- Implémenter **au minimum 1 fonctionnalité**

### Format attendu

Backlog avec :

- User Stories
- Critères d’acceptation

---

## 2.2 Architecture technique

Doit inclure :

- Type de base de données
- Framework
- Protocole de communication
- Orchestrateur ou cloud
- Sécurité
- Observabilité

### Exemples d’orchestrateurs

- Kubernetes
- Minikube

---

## 2.3 Expérimentation (Sandbox)

### Objectif

Tester les technologies critiques avant implémentation.

### Doit inclure :

- Environnement de test
- Étapes de reproduction
- Difficultés rencontrées
- Limites identifiées
- Justification d’adoption ou rejet

### Exemples valides :

- Mise en place CI/CD complète
- Déploiement d’un broker dans Kubernetes
- Mise en place d’un cert-manager
- Observabilité
- API Gateway
- Service Mesh
- Serverless
- Clustering BDD

### Exemples non valides :

- Test d’un langage
- Test REST simple
- Exécution locale de tests unitaires
- Implémentation basique d’un framework

---

## 2.4 Développement du prototype

### Contraintes

- Niveau prototypage
- Respect backlog
- Respect architecture
- Intégration sécurité

### Sécurité minimale obligatoire

- HTTPS / TLS
- Authentification / Autorisation (ex : Keycloak)
- Scan de vulnérabilités

### Observabilité

Au moins une composante :

- Logs centralisés
- Collecte de métriques
- Traces distribuées

---

## 2.5 Tests & montée en charge

Présentation obligatoire de tests de charge.

Exemples d’outils :

- Apache JMeter
- Siege

---

# 🔹 PHASE 3 — Plan de remédiation sécurité

## 3.1 Audit de la V1

Analyser :

- Résultats des tests
- Métriques collectées
- Vulnérabilités potentielles
- Résultats tests de charge

---

## 3.2 Plan de remédiation

Doit inclure :

- Vulnérabilité identifiée
- Risque associé
- Action corrective
- Justification technique
- Priorisation

---

# 📦 Livrables attendus

## 1️⃣ Documentation

- Processus qualité
- Pipeline CI/CD schématisé
- Architecture technique
- Protocole d’expérimentation
- Backlog
- Analyse sécurité
- Plan de remédiation

## 2️⃣ Prototype fonctionnel

- 1 fonctionnalité métier
- Pipeline CI/CD
- Tests automatisés
- Sécurité minimale
- Observabilité minimale

## 3️⃣ Soutenance

- 20 minutes présentation
- 15 minutes échange
- Démonstration fluide
- Tests de charge en direct
- Prévoir vidéo de secours

---

# ⚠️ Contraintes importantes

- Travail individuel
- Public cible : experts techniques
- Précision terminologique obligatoire
- Schémas lisibles et complets
- Pas de vulgarisation excessive

---

# 🧠 Résumé pour IA

Le projet doit démontrer :

- Maîtrise DevSecOps
- Mise en place CI/CD complète
- Implémentation fonctionnelle minimale
- Sécurité intégrée
- Observabilité
- Capacité d’analyse critique
- Plan d’amélioration continue
