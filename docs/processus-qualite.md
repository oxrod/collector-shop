# Processus d'assurance qualité logicielle

Référentiel : ISO/IEC 25010. Objectifs : performance, fiabilité, disponibilité, sécurité, maintenabilité, capacité fonctionnelle.

---

## 1. Indicateurs qualité (4 métriques minimum)

Chaque métrique est **justifiée**, **mesurable** et permet de **limiter la dette technique**.

| Indicateur | Objectif | Mesure | Impact dette technique |
|------------|----------|--------|------------------------|
| **Couverture de tests** | ≥ 80 % (lignes/instructions) | Jest `coverageThreshold` + SonarQube | Réduit les régressions et permet des refactorings en confiance. |
| **Complexité cyclomatique** | < 15 par méthode | SonarQube (règle S3776) | Améliore la maintenabilité et la testabilité du code. |
| **Taux d'échec du pipeline** | < 5 % | Suivi des runs GitHub Actions | Stabilise la livraison et évite les livraisons cassées. |
| **Temps moyen de déploiement** | < 15 min (objectif) | Durée du job Deploy (build + push + apply K8s) | Optimise le delivery et la réactivité. |

---

## 2. Mise en œuvre

- **Couverture** : `backend`, `fraud-service`, `notification-service` ont un `coverageThreshold` (80 % lignes/statements, 70 % branches/functions). Le pipeline CI exécute `npm test -- --coverage` et envoie les rapports à SonarQube.
- **Complexité** : Qualité de code et complexité suivies dans SonarQube ; à configurer en Quality Gate (ex. : complexité max par méthode).
- **Taux d'échec** : Suivi manuel ou via API GitHub / badges ; objectif < 5 % sur la branche `main`.
- **Déploiement** : Workflow `.github/workflows/deploy.yml` ; objectif de rester sous 15 min de bout en bout.

---

## 3. Politique de tests

- **Unitaires** : obligatoires sur le code métier (backend, fraud-service, notification-service) ; exécutés à chaque push/PR.
- **Intégration / E2E** : job dédié dans CI qui lance le backend + base, puis exécute les scénarios E2E (`tests/e2e/`).
- **Couverture** : seuils définis dans les `package.json` ; le build échoue si les seuils ne sont pas atteints.

---

## 4. Politique de sécurité

- **Analyse statique** : SonarQube (qualité + failles).
- **Dépendances** : Snyk (workflow Security) sur backend, frontend, fraud-service, notification-service.
- **Conteneurs** : Trivy sur les images Docker.
- **DAST** : OWASP ZAP Baseline sur l’API (workflow Security, après montée de la stack).

Détail des étapes et enchaînements : voir [Pipeline CI/CD et DevSecOps](cicd-devsecops.md).
