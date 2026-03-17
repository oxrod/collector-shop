# 🛒 Marketplace Platform

Plateforme e-commerce sécurisée en architecture microservices.

## Architecture

| Service                  | Techno        | Port | Description                  |
| ------------------------ | ------------- | ---- | ---------------------------- |
| **Frontend**             | React + Vite  | 3000 | Interface utilisateur        |
| **Backend**              | NestJS        | 3001 | API REST principale          |
| **Fraud Service**        | Express       | 3002 | Validation anti-fraude       |
| **Notification Service** | Express       | 3003 | Envoi de notifications       |
| **Keycloak**             | Keycloak      | 8080 | Authentification OAuth2/OIDC |
| **PostgreSQL**           | PostgreSQL 16 | 5432 | Base de données              |
| **Prometheus**           | Prometheus    | 9090 | Collecte métriques           |
| **Grafana**              | Grafana       | 3100 | Dashboards                   |

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+
- npm

### Lancer tous les services

```bash
docker-compose up --build
```

### Développement local (sans Docker)

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev

# Fraud Service
cd fraud-service && npm install && npm run dev

# Notification Service
cd notification-service && npm install && npm run dev
```

## Tests

```bash
# Tests unitaires backend
cd backend && npm test

# Tests e2e
cd tests && npm test

# Tests de charge
jmeter -t tests/jmeter/load-test.jmx
```

## CI/CD

Pipeline GitHub Actions (cycle DevSecOps complet) :

1. **CI** (`ci.yml`) : Lint → Tests unitaires (couverture) → Build → **Tests d'intégration E2E** → SonarQube
2. **Security** (`security.yml`) : Snyk (dépendances) → OWASP ZAP (DAST) → Trivy (images Docker)
3. **Deploy** (`deploy.yml`) : Docker Build → Push GHCR → Kubernetes → Smoke test

Voir [docs/cicd-devsecops.md](docs/cicd-devsecops.md) pour le schéma et les liens avec les métriques qualité.

## Kubernetes (Kustomize)

Les manifestes Kubernetes utilisent **Kustomize** avec trois environnements : `dev` (Minikube), `staging` et `production`. Voir **[docs/minikube-deployment.md](docs/minikube-deployment.md)** pour le guide complet.

```powershell
# Démarrage rapide sur Minikube
.\infra\k8s\minikube-start.ps1 -Bootstrap
docker build -t marketplace/backend:latest ./backend   # + autres services
.\infra\k8s\minikube-load-images.ps1
kubectl apply -k infra/k8s/overlays/dev
```

| Action | Commande |
|--------|----------|
| Démarrer Minikube + bootstrap | `.\infra\k8s\minikube-start.ps1 -Bootstrap` |
| Charger images dans Minikube | `.\infra\k8s\minikube-load-images.ps1` |
| Déployer dev | `kubectl apply -k infra/k8s/overlays/dev` |
| Déployer staging | `kubectl apply -k infra/k8s/overlays/staging` |
| Déployer production | `kubectl apply -k infra/k8s/overlays/production` |

## Monitoring

- **Prometheus** : http://localhost:9090
- **Grafana** : http://localhost:3100 (admin/admin)

## Documentation (livrables projet)

| Document | Description |
|----------|-------------|
| [docs/processus-qualite.md](docs/processus-qualite.md) | Processus qualité, 4 indicateurs, politique de tests et sécurité |
| [docs/cicd-devsecops.md](docs/cicd-devsecops.md) | Pipeline CI/CD, schéma DevSecOps, outils et enchaînement |
| [docs/architecture.md](docs/architecture.md) | Architecture technique (DB, frameworks, sécurité, observabilité) |
| [docs/backlog.md](docs/backlog.md) | Backlog User Stories et critères d'acceptation |
| [docs/audit-securite-v1.md](docs/audit-securite-v1.md) | Audit sécurité V1 (tests, métriques, vulnérabilités) |
| [docs/plan-remediation-securite.md](docs/plan-remediation-securite.md) | Plan de remédiation sécurité (priorisé) |
| [docs/experimentation.md](docs/experimentation.md) | Protocole d'expérimentation (CI/CD, observabilité) |
| [docs/competences-formation.md](docs/competences-formation.md) | Cartographie compétences et actions de formation |
| [docs/minikube-deployment.md](docs/minikube-deployment.md) | Déploiement Kubernetes avec Kustomize (dev, staging, production) |
