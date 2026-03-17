# Tests de charge — Siege

Tests de montée en charge pour la marketplace Collector Shop, utilisant [Siege](https://www.joedog.org/siege-home/).

## Prérequis

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install -y siege
```

### macOS

```bash
brew install siege
```

### Windows

Siege n'est pas nativement disponible sur Windows. Utiliser WSL :

```powershell
wsl sudo apt-get install -y siege
```

Le script `run-load-tests.ps1` appelle automatiquement Siege via WSL.

## Démarrage rapide

1. Lancer la stack applicative :

```bash
docker-compose up -d
```

2. Vérifier que le backend répond :

```bash
curl http://localhost:3001/api/health
```

3. Lancer tous les scénarios :

```bash
cd tests/siege
chmod +x run-load-tests.sh
./run-load-tests.sh
```

Sur Windows (PowerShell) :

```powershell
cd tests\siege
.\run-load-tests.ps1
```

## Scénarios

| Scénario | Utilisateurs | Durée | URLs | Objectif |
|----------|-------------|-------|------|----------|
| **Baseline** | 25 | 60s | urls-public.txt | Mesurer les performances de référence |
| **Load** | 100 | 120s | urls-public.txt | Simuler une charge normale soutenue |
| **Stress** | 250 | 60s | urls-stress.txt | Tester les limites de capacité |
| **Microservices** | 50 | 60s | urls-microservices.txt | Valider les services annexes |

### Lancer un scénario individuel

```bash
# Depuis la racine du projet
cd tests
npm run siege:baseline
npm run siege:load
npm run siege:stress
```

Ou directement via Siege :

```bash
siege --rc=siege.conf -c 25 -t 60S -f urls-public.txt
```

## Variables d'environnement

Les scripts acceptent des variables pour ajuster les paramètres sans modifier les fichiers :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BACKEND_URL` | `http://localhost:3001` | URL de base du backend (ou de la gateway) |
| `FRAUD_URL` | `http://localhost:3002` | URL du fraud-service |
| `NOTIFICATION_URL` | `http://localhost:3003` | URL du notification-service |
| `SIEGE_HEADER` | _(vide)_ | Header HTTP additionnel (ex: `Host: staging.marketplace.local`) |
| `GATEWAY_MODE` | `false` | Si `true`, teste aussi `/` (frontend) et `/auth` (Keycloak) |
| `BASELINE_CONCURRENT` | 25 | Utilisateurs concurrents (baseline) |
| `BASELINE_TIME` | 60S | Durée du test (baseline) |
| `LOAD_CONCURRENT` | 100 | Utilisateurs concurrents (load) |
| `LOAD_TIME` | 120S | Durée du test (load) |
| `STRESS_CONCURRENT` | 250 | Utilisateurs concurrents (stress) |
| `STRESS_TIME` | 60S | Durée du test (stress) |

Exemple :

```bash
STRESS_CONCURRENT=500 STRESS_TIME=120S ./run-load-tests.sh
```

## Résultats

Les résultats sont enregistrés dans `tests/siege/results/` avec un horodatage.

Exemple de sortie Siege :

```
Transactions:               12000 hits
Availability:               99.92 %
Elapsed time:               59.87 secs
Data transferred:            5.23 MB
Response time:               0.12 secs
Transaction rate:          200.40 trans/sec
Throughput:                  0.09 MB/sec
Concurrency:                24.85
Successful transactions:    12000
Failed transactions:           10
Longest transaction:         1.25
Shortest transaction:        0.01
```

### Seuils d'acceptation

| Métrique | Seuil | Signification |
|----------|-------|---------------|
| Availability | > 99% | Le serveur doit rester disponible |
| Response time (avg) | < 500ms | Temps de réponse moyen acceptable |
| Longest transaction | < 2000ms | Aucune requête ne doit dépasser 2s |
| Failed transactions | < 1% du total | Taux d'erreur minimal |

## Tests de charge sur Kubernetes (via Ingress Gateway)

Le script `run-k8s-load-tests.sh` stress-teste l'infrastructure K8s complète en envoyant tout le trafic par la **gateway Ingress nginx**. Cela teste la chaîne complète :

```
Siege → Ingress Controller → Ingress Rules → Services → Pods → Database
```

### Usage

```bash
# Contre le namespace staging
NAMESPACE=staging ./run-k8s-load-tests.sh

# Contre le namespace production (concurrence réduite)
NAMESPACE=production STRESS_CONCURRENT=100 ./run-k8s-load-tests.sh
```

### Fonctionnement

Le script :

1. Port-forward le **ingress-nginx-controller** (namespace `ingress-nginx`) vers le port local 8080
2. Injecte le header `Host:` correspondant au namespace (`staging.marketplace.local`, `marketplace.example.com`)
3. Active le **mode gateway** : les URLs incluent les 3 routes de l'ingress (`/` frontend, `/api` backend, `/auth` Keycloak)
4. Exécute les scénarios Siege (baseline, load, stress)
5. Ferme le port-forward automatiquement en sortie

### Mode gateway vs mode direct

| | Mode direct (par défaut) | Mode gateway (`GATEWAY_MODE=true`) |
|---|---|---|
| Cible | Service backend uniquement | Ingress → frontend + API + auth |
| Header Host | Aucun | `Host: <ingress-hostname>` |
| Endpoints testés | `/api/*` | `/`, `/api/*`, `/auth` |
| Usage | Docker Compose, CI | Kubernetes |

### Variables spécifiques K8s

| Variable | Défaut | Description |
|----------|--------|-------------|
| `NAMESPACE` | `staging` | Namespace K8s cible |
| `INGRESS_NS` | `ingress-nginx` | Namespace de l'ingress controller |
| `INGRESS_SVC` | `ingress-nginx-controller` | Nom du service ingress |
| `INGRESS_LOCAL_PORT` | `8080` | Port local pour le port-forward |

### Hostnames par environnement

| Namespace | Hostname Ingress |
|-----------|-----------------|
| `default` (dev) | `marketplace.local` |
| `staging` | `staging.marketplace.local` |
| `production` | `marketplace.example.com` |

## Intégration CI/CD

### Pipeline CI (`ci.yml`)

Le job `load-test` s'exécute en CI avec le backend lancé localement (PostgreSQL en service container) :

- S'exécute après `backend` et `integration`
- Durées réduites (30s/60s/30s) pour les runners CI
- Artefact : `siege-load-test-results`

### Pipeline Deploy (`deploy.yml`)

Deux jobs de charge post-déploiement stress-testent l'infrastructure K8s via l'ingress gateway :

| Job | Exécution | Host header | Artefact |
|-----|-----------|-------------|----------|
| `load-test-staging` | Après `deploy-staging` | `staging.marketplace.local` | `siege-staging-results` |
| `load-test-production` | Après `deploy-production` | `marketplace.example.com` | `siege-production-results` |

Chaque job :
- Configure kubectl via `KUBE_CONFIG`
- Port-forward le **ingress-nginx-controller** (port 80 -> local 8080)
- Envoie les requêtes avec le header `Host:` correct pour le routage ingress
- Active `GATEWAY_MODE=true` pour tester frontend + API + auth
- Uploade les résultats comme artefact GitHub Actions
- Utilise `continue-on-error: true` pour ne pas bloquer le pipeline

### Consulter les résultats

1. Aller sur l'onglet **Actions** du dépôt GitHub
2. Sélectionner le run du pipeline
3. Télécharger l'artefact correspondant (`siege-load-test-results`, `siege-staging-results` ou `siege-production-results`)

## Structure des fichiers

```
tests/siege/
├── urls-public.txt           # Endpoints publics (templates par défaut)
├── urls-microservices.txt    # Endpoints microservices (templates par défaut)
├── urls-stress.txt           # Endpoints pondérés pour stress maximal
├── siege.conf                # Configuration Siege
├── run-load-tests.sh         # Script principal (Linux/macOS), paramétrable via env vars
├── run-load-tests.ps1        # Script principal (Windows/WSL)
├── run-k8s-load-tests.sh     # Script K8s (port-forward automatique + siege)
├── results/                  # Résultats générés (gitignored)
└── README.md                 # Cette documentation
```
