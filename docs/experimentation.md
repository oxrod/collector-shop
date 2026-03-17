# Protocole d'expérimentation (Sandbox)

Conformément aux consignes : environnement de test, étapes de reproduction, difficultés, limites, justification d’adoption ou de rejet.

---

## 1. Expérimentation : Chaîne CI/CD complète

### Objectif

Valider une chaîne CI/CD intégrant build, tests (unitaires + intégration), analyse statique, scan de vulnérabilités et déploiement automatisé (ou simulé) vers Kubernetes.

### Environnement de test

- **Outils** : GitHub Actions, Docker, Kubernetes (Minikube ou cluster managé).
- **Dépôt** : branche dédiée ou repo de démo.
- **Secrets** : `SONAR_TOKEN`, `SONAR_HOST_URL`, `SNYK_TOKEN`, `KUBE_CONFIG` (pour déploiement réel).

### Étapes de reproduction

1. Configurer les secrets dans le dépôt GitHub.
2. Pousser sur `main` (ou ouvrir une PR) pour déclencher le workflow CI.
3. Vérifier : lint → tests unitaires (avec couverture) → build → job d’intégration E2E → SonarQube.
4. Déclencher le workflow Security (push main ou planifié) : Snyk, ZAP, Trivy.
5. Déclencher le workflow Deploy (push main ou tag) : build images → push GHCR → apply K8s → smoke test.

### Difficultés rencontrées

- **SonarQube** : nécessite un serveur ou projet cloud ; configuration `sonar-project.properties` et chemins de couverture (backend + services).
- **E2E en CI** : démarrage du backend + Postgres dans le job ; gestion des variables d’environnement (DB_*, API_URL).
- **ZAP** : stack complète à lancer (docker-compose) ; temps de montée ; règles optionnelles (fichier `.zap/rules.tsv`) pour réduire les faux positifs.
- **Kubernetes** : accès au cluster (kubeconfig) et droits suffisants pour `kubectl apply`.

### Limites identifiées

- Déploiement K8s dépend d’un cluster accessible (Minikube local ou cloud) et du secret `KUBE_CONFIG`.
- ZAP et Trivy peuvent faire échouer le job si des vulnérabilités sont trouvées (selon configuration ; actuellement Snyk en `continue-on-error`).
- Couverture à 80 % peut faire échouer le build si le code n’est pas suffisamment testé.

### Justification d’adoption

- **Adoption** : la chaîne CI/CD est retenue car elle couvre les exigences DevSecOps (tests, analyse statique, scans, build, déploiement) et est reproductible. Les difficultés sont surmontables par configuration (secrets, Quality Gates, seuils de couverture).

---

## 2. Expérimentation : Observabilité (Prometheus + Grafana)

### Objectif

Vérifier la collecte de métriques et la visualisation dans Grafana.

### Environnement

- Docker Compose : backend, fraud-service, notification-service, Prometheus, Grafana.
- Fichiers : `docker-compose.yml`, `monitoring/prometheus/prometheus.yml`, `monitoring/grafana/`.

### Étapes

1. `docker-compose up -d` (services applicatifs + Prometheus + Grafana).
2. Vérifier les cibles Prometheus (http://localhost:9090/targets).
3. Se connecter à Grafana (admin/admin), importer ou utiliser les dashboards provisionnés.
4. Vérifier que les métriques HTTP (requêtes, latence) sont présentes.

### Difficultés / limites

- Prometheus doit scraper les bons endpoints (`/metrics` ou `/api/metrics`) ; configuration des jobs dans `prometheus.yml`.
- Pas de traces distribuées ni de logs centralisés en V1.

### Justification

- **Adoption** : Prometheus + Grafana permettent de répondre à l’exigence « au moins une composante d’observabilité » (métriques) et préparent la production.

---

## 3. Exemples non valides (consignes)

- Test d’un langage seul.
- Test REST simple sans intégration à la chaîne.
- Exécution locale de tests unitaires sans automatisation.
- Implémentation basique d’un framework sans mise en situation (CI, déploiement, sécurité).

Les expérimentations ci-dessus vont au-delà : elles intègrent CI/CD, observabilité et déploiement conteneurisé.
