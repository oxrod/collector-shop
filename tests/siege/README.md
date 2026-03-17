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

## Intégration CI/CD

Les tests de charge sont exécutés automatiquement dans le pipeline GitHub Actions (job `load-test` dans `ci.yml`).

- Le job s'exécute après `backend` et `integration`
- Les durées sont réduites en CI (30s/60s/30s) pour respecter les limites des runners
- Les résultats sont uploadés comme artefact `siege-load-test-results`
- Le job utilise `continue-on-error: true` : un échec ne bloque pas le pipeline

Pour consulter les résultats :
1. Aller sur l'onglet **Actions** du dépôt GitHub
2. Sélectionner le run du pipeline
3. Télécharger l'artefact `siege-load-test-results`

## Structure des fichiers

```
tests/siege/
├── urls-public.txt         # Endpoints publics (health, articles, categories, shops, metrics)
├── urls-microservices.txt  # Endpoints des microservices (fraud, notification)
├── urls-stress.txt         # Endpoints pondérés pour stress maximal
├── siege.conf              # Configuration Siege
├── run-load-tests.sh       # Script d'exécution (Linux/macOS)
├── run-load-tests.ps1      # Script d'exécution (Windows/WSL)
├── results/                # Résultats générés (gitignored)
└── README.md               # Cette documentation
