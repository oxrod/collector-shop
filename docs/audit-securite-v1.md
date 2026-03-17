# Audit de sécurité V1

Analyse de la version 1 du prototype : résultats des tests, métriques collectées, vulnérabilités potentielles, résultats des tests de charge.

---

## 1. Périmètre

- Backend (NestJS), Fraud Service, Notification Service, Frontend (React).
- Pipeline CI (tests, build), pipeline Security (Snyk, ZAP, Trivy), déploiement K8s.
- Authentification Keycloak, base PostgreSQL, exposition API REST.

---

## 2. Résultats des tests

- **Tests unitaires** : exécutés en CI ; couverture visée ≥ 80 % (lignes/statements) avec seuils dans Jest.
- **Tests d’intégration / E2E** : job CI dédié ; vérification health, liste articles, 401 sur création non authentifiée, 400 sur données invalides.
- **Tests de charge** : scénario JMeter dans `tests/jmeter/load-test.jmx` ; à exécuter manuellement ou en démo (présentation obligatoire selon consignes).

---

## 3. Métriques collectées

- **Qualité de code** : SonarQube (couverture, duplications, bugs, vulnérabilités, code smells).
- **Sécurité dépendances** : Snyk (niveau high et au-dessus selon workflow).
- **Images Docker** : Trivy (CRITICAL/HIGH).
- **API exposée** : OWASP ZAP Baseline (DAST) sur l’URL de l’API après montée de la stack.

Les métriques applicatives (requêtes HTTP, latence) sont exposées via Prometheus et visualisables dans Grafana.

---

## 4. Vulnérabilités potentielles (à compléter avec les rapports réels)

À renseigner à partir des sorties Snyk, Trivy et ZAP après exécution des workflows :

| Source | Type | Exemple / risque |
|--------|------|-------------------|
| Snyk | Dépendances obsolètes / vulnérables | CVE sur librairies npm |
| Trivy | Image de base, binaires | CVE sur l’image Node/Alpine |
| ZAP | Configuration HTTP, en-têtes, injection | En-têtes de sécurité manquants, injection possible |
| Revue manuelle | Config (secrets, CORS, rate limit) | Clés en dur, CORS trop permissif |

---

## 5. Résultats des tests de charge

- **Outil** : Apache JMeter (`tests/jmeter/load-test.jmx`).
- **Exécution** : `jmeter -t tests/jmeter/load-test.jmx` (voir README).
- **Indicateurs à suivre** : débit (req/s), temps de réponse (médiane, p95), taux d’erreur.

Les résultats sont à documenter ici après une campagne de tests (objectifs : pas de régression, respect des SLA cibles).

---

## 6. Synthèse

- Les mécanismes de sécurité (auth Keycloak, Helmet, rate limit, scans) sont en place.
- Les vulnérabilités concrètes doivent être extraites des rapports Snyk/Trivy/ZAP et traitées selon le [Plan de remédiation](plan-remediation-securite.md).
- HTTPS en production et gestion des secrets (variables d’environnement, pas de clés en dur) sont à confirmer sur l’environnement de déploiement.
