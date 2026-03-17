# Architecture technique (Collector.shop V1)

Conforme aux exigences : type de base de données, frameworks, protocole de communication, orchestrateur/cloud, sécurité, observabilité.

---

## 1. Synthèse

| Dimension | Choix | Détail |
|-----------|--------|--------|
| **Base de données** | PostgreSQL 16 | Relationnelle ; utilisée par le backend et Keycloak. |
| **Framework backend** | NestJS | API REST principale (TypeORM, validation, Swagger). |
| **Frameworks services** | Express (Node.js) | Fraud Service, Notification Service. |
| **Frontend** | React + Vite | SPA ; authentification Keycloak (OIDC). |
| **Protocole de communication** | HTTP/HTTPS, REST | API REST JSON ; TLS en production. |
| **Orchestrateur / Cloud** | Kubernetes (manifests dans `infra/k8s/`) | Déploiement conteneurisé ; possible Minikube / cloud managé. |
| **Sécurité** | HTTPS, Keycloak, Helmet, rate limit, scans | Voir section 3. |
| **Observabilité** | Prometheus, Grafana, Alertmanager | Métriques exposées par les services (prom-client). |

---

## 2. Composants

- **Frontend** : React + Vite, port 3000 (dev) / 80 (conteneur).
- **Backend** : NestJS, port 3001, préfixe `/api`, Swagger sous `/api/docs`.
- **Fraud Service** : Express, port 3002.
- **Notification Service** : Express, port 3003 (SMTP via MailHog en dev).
- **Keycloak** : OAuth2/OIDC, port 8080.
- **PostgreSQL** : port 5432.
- **Prometheus** : port 9090.
- **Grafana** : port 3100 (mapping 3100:3000 dans le repo).
- **Alertmanager** : port 9093.

Les métriques (HTTP, défaut Node) sont exposées sur `/metrics` (backend sous `/api/metrics`) et scrapées par Prometheus.

---

## 3. Sécurité

- **HTTPS / TLS** : à activer en production (Ingress, cert-manager ou équivalent).
- **Authentification / autorisation** : Keycloak (JWT) ; stratégie Passport (backend).
- **Dépendances** : Snyk (workflow Security).
- **Conteneurs** : Trivy (workflow Security).
- **DAST** : OWASP ZAP Baseline sur l’API (workflow Security).
- **Application** : Helmet, rate limiting (backend et services Express).

---

## 4. Observabilité

- **Métriques** : Prometheus + prom-client (backend, fraud-service, notification-service) ; dashboards Grafana.
- **Alertes** : Alertmanager (règles dans `monitoring/prometheus/alert_rules.yml`).
- **Logs** : sortie standard des conteneurs ; centralisation optionnelle (ex. Loki, ELK) en évolution.
- **Traces** : non mises en place en V1 ; envisageable (ex. Jaeger) en V2.

---

## 5. Déploiement

- **Build** : Dockerfiles par service ; build et push vers GHCR dans le workflow Deploy.
- **Orchestration** : manifests Kubernetes dans `infra/k8s/` (deployments, services, configs).
- **Environnement** : GitHub Actions avec secret `KUBE_CONFIG` et environnement `production`.

Voir aussi [Pipeline CI/CD et DevSecOps](cicd-devsecops.md) et [Processus qualité](processus-qualite.md).
