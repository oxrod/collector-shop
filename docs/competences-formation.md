# Cartographie des compétences et actions de formation

Conformément aux consignes : cartographie des compétences, montée en compétence réaliste, pas de « profil mouton à 5 pattes ».

---

## 1. Cartographie des compétences (exemples)

| Domaine | Compétences attendues | Niveau cible (équipe) |
|---------|------------------------|------------------------|
| **Backend** | NestJS, TypeORM, API REST, validation (class-validator) | Confirmé sur au moins 1 dev |
| **Frontend** | React, Vite, intégration OIDC (Keycloak) | Confirmé sur au moins 1 dev |
| **DevOps** | Docker, GitHub Actions, Kubernetes (manifests, déploiement) | Au moins 1 personne capable de faire évoluer la CI/CD |
| **Sécurité** | OAuth2/OIDC, scans (Snyk, Trivy, ZAP), bonnes pratiques (Helmet, rate limit) | Sensibilisation équipe + 1 référent |
| **Cloud / K8s** | Déploiement K8s, gestion des secrets, Ingress/TLS | Au moins 1 personne pour la mise en production |
| **Observabilité** | Prometheus, Grafana, métriques applicatives (prom-client) | Au moins 1 personne pour maintenir dashboards et alertes |

---

## 2. Actions de formation (montée en compétence réaliste)

- **Backend / API** : Parcours NestJS (doc officielle + atelier « API sécurisée ») ; cible : 1 à 2 devs pour maintenir et faire évoluer le backend.
- **Frontend** : Parcours React + Vite (doc officielle) ; cible : 1 dev front pour l’interface et l’intégration Keycloak.
- **CI/CD** : Formation GitHub Actions (workflows, secrets, artefacts) ; cible : 1 personne (Lead Dev ou dev confirmé) pour faire évoluer les workflows.
- **Sécurité** : Module « Sécurité des applications web » (OWASP Top 10, scans Snyk/ZAP) ; cible : toute l’équipe en sensibilisation, 1 référent pour les rapports et remédiations.
- **Observabilité** : Formation Prometheus + Grafana (métriques, alertes, dashboards) ; cible : 1 personne pour configurer et maintenir la stack de monitoring.

Aucune action ne vise un « profil mouton à 5 pattes » : chaque formation cible un domaine précis et un niveau réaliste (sensibilisation vs expert).

---

## 3. Rôle Lead Developer

- Piloter la définition des indicateurs qualité et du processus (voir [Processus qualité](processus-qualite.md)).
- Superviser la chaîne CI/CD et les livraisons (voir [Pipeline CI/CD et DevSecOps](cicd-devsecops.md)).
- S’assurer que la cartographie et les formations sont alignées avec l’architecture et les livrables du projet.
