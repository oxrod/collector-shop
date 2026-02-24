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

Pipeline GitHub Actions :

1. **CI** : Build → Tests → SonarQube
2. **Security** : OWASP ZAP + Snyk
3. **Deploy** : Docker Build → Push → Kubernetes

## Monitoring

- **Prometheus** : http://localhost:9090
- **Grafana** : http://localhost:3100 (admin/admin)
