# Deploiement Kubernetes avec Kustomize

Guide complet pour deployer Collector.shop sur Kubernetes en local (Minikube) ou sur un cluster distant, en utilisant Kustomize pour gerer trois environnements : **dev**, **staging** et **production**.

---

## Prerequis

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| Minikube | 1.30+ | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| kubectl | 1.28+ | Fourni avec Minikube ou [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Docker Desktop | 4.x | [docker.com](https://www.docker.com/products/docker-desktop/) |

Docker Desktop doit etre en cours d'execution avant de lancer Minikube.

---

## Architecture Kustomize

Les manifestes sont organises selon le pattern Kustomize **base + overlays** :

```
infra/k8s/
  base/                              # Ressources partagees par tous les environnements
    kustomization.yaml
    backend/deployment.yaml          # Deployment + Service
    frontend/deployment.yaml
    fraud-service/deployment.yaml
    notification-service/deployment.yaml
    keycloak/deployment.yaml
    postgres/deployment.yaml         # Deployment + Service + PVC
    postgres/init.sql
    monitoring/deployment.yaml       # Prometheus
    ingress.yaml                     # Ingress nginx (HTTP)
  overlays/
    dev/                             # Minikube local
      kustomization.yaml
    staging/                         # Pre-production
      kustomization.yaml
      hpa.yaml
    production/                      # Production
      kustomization.yaml
      hpa.yaml
      network-policies.yaml
  minikube-start.ps1                 # Script de demarrage Minikube
  minikube-bootstrap.ps1             # Creation des secrets et ConfigMap
  minikube-load-images.ps1           # Chargement des images dans Minikube
```

### Comparaison des environnements

| | dev | staging | production |
|---|---|---|---|
| **Namespace** | `default` | `staging` | `production` |
| **imagePullPolicy** | `Never` | `IfNotPresent` | `IfNotPresent` |
| **Replicas backend** | 1 | 2 | 2 |
| **Replicas frontend** | 1 | 2 | 2 |
| **HPA** | Non | Backend (max 5) | Backend (max 10) + Frontend (max 5) |
| **TLS (cert-manager)** | Non | Non | Oui (letsencrypt-prod) |
| **Network Policies** | Non | Non | Oui |
| **Ressources** | Base | Base | Augmentees (backend, keycloak, postgres) |
| **Hostname ingress** | `marketplace.local` | `staging.marketplace.local` | `marketplace.example.com` |

---

## Deploiement local (dev sur Minikube)

### 1. Demarrer Minikube

Depuis la racine du repo, en PowerShell :

```powershell
.\infra\k8s\minikube-start.ps1 -Bootstrap
```

Ce script enchaine automatiquement :

1. `minikube start` (driver Docker)
2. `kubectl config use-context minikube`
3. `minikube addons enable ingress`
4. Creation des secrets (`db-credentials`, `keycloak-credentials`) et du ConfigMap (`postgres-init`)

Pour faire chaque etape manuellement :

```powershell
minikube start
kubectl config use-context minikube
minikube addons enable ingress
.\infra\k8s\minikube-bootstrap.ps1
```

### 2. Construire et charger les images

Les deployments utilisent `imagePullPolicy: Never` en dev : les images doivent etre presentes dans Minikube avant le deploiement.

```powershell
# Construire toutes les images
docker build -t marketplace/backend:latest ./backend
docker build -t marketplace/frontend:latest ./frontend
docker build -t marketplace/fraud-service:latest ./fraud-service
docker build -t marketplace/notification-service:latest ./notification-service
docker build -t marketplace/keycloak:latest ./auth

# Charger dans Minikube
.\infra\k8s\minikube-load-images.ps1
```

Verifier que les images sont bien presentes :

```powershell
minikube image ls | Select-String marketplace
```

### 3. Deployer avec Kustomize

```powershell
kubectl apply -k infra/k8s/overlays/dev
```

Pour visualiser les manifestes generes sans les appliquer :

```powershell
kubectl kustomize infra/k8s/overlays/dev
```

### 4. Verifier le deploiement

```powershell
# Tous les pods
kubectl get pods

# Services
kubectl get svc

# Ingress
kubectl get ingress

# Attendre que tous les pods soient prets
kubectl wait --for=condition=ready pod --all --timeout=180s
```

### 5. Acceder aux services

**Option A : port-forward (recommande sur Windows)**

```powershell
# Frontend
kubectl port-forward svc/frontend 3000:80
# -> http://localhost:3000

# Backend API
kubectl port-forward svc/backend 3001:3001
# -> http://localhost:3001/api

# Keycloak
kubectl port-forward svc/keycloak 8080:8080
# -> http://localhost:8080
```

**Option B : via Ingress**

```powershell
# Demarrer le tunnel dans un PowerShell admin
minikube tunnel

# Ajouter dans C:\Windows\System32\drivers\etc\hosts (en admin) :
# 127.0.0.1  marketplace.local
```

Puis acceder a :
- Frontend : `http://marketplace.local/`
- API : `http://marketplace.local/api/`
- Keycloak : `http://marketplace.local/auth`

### 6. Smoke test

```powershell
# Health check du backend
kubectl port-forward svc/backend 3001:3001
# Dans une autre session :
Invoke-WebRequest -Uri http://localhost:3001/api/health -UseBasicParsing
```

### 7. Demontage

```powershell
kubectl delete -k infra/k8s/overlays/dev
kubectl delete secret db-credentials keycloak-credentials
kubectl delete configmap postgres-init
minikube stop
```

Pour supprimer completement le cluster :

```powershell
minikube delete
```

---

## Deploiement staging

```powershell
# Creer le namespace
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

# Creer les secrets dans le namespace staging
kubectl create secret generic db-credentials \
    --namespace staging \
    --from-literal=username=marketplace \
    --from-literal=password=marketplace_secret \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic keycloak-credentials \
    --namespace staging \
    --from-literal=admin-password=admin \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap postgres-init \
    --namespace staging \
    --from-file=init.sql=infra/k8s/base/postgres/init.sql \
    --dry-run=client -o yaml | kubectl apply -f -

# Deployer
kubectl apply -k infra/k8s/overlays/staging
```

Specificites staging :
- Namespace `staging`, hostname `staging.marketplace.local`
- Backend et frontend a 2 replicas
- HPA sur le backend (2-5 replicas, seuil CPU 70%)

---

## Deploiement production

```powershell
# Creer le namespace
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -

# Creer les secrets dans le namespace production (utiliser des valeurs securisees)
kubectl create secret generic db-credentials \
    --namespace production \
    --from-literal=username=<DB_USER> \
    --from-literal=password=<DB_PASSWORD> \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic keycloak-credentials \
    --namespace production \
    --from-literal=admin-password=<KEYCLOAK_ADMIN_PASSWORD> \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap postgres-init \
    --namespace production \
    --from-file=init.sql=infra/k8s/base/postgres/init.sql \
    --dry-run=client -o yaml | kubectl apply -f -

# Deployer
kubectl apply -k infra/k8s/overlays/production
```

Specificites production :
- Namespace `production`, hostname `marketplace.example.com`
- TLS avec cert-manager (`letsencrypt-prod`)
- HPA sur backend (2-10) et frontend (2-5)
- Network Policies (isolation backend et base de donnees)
- Ressources augmentees (backend 200m-1 CPU / 512Mi-1Gi, keycloak 500m-2 CPU / 1Gi-2Gi, postgres 250m-1 CPU / 512Mi-1Gi)

---

## Composants deployes

| Service | Image | Port | Health check |
|---------|-------|------|-------------|
| **Backend** | `marketplace/backend:latest` | 3001 | `/api/health` |
| **Frontend** | `marketplace/frontend:latest` | 80 | - |
| **Fraud Service** | `marketplace/fraud-service:latest` | 3002 | `/health` |
| **Notification Service** | `marketplace/notification-service:latest` | 3003 | `/health` |
| **Keycloak** | `marketplace/keycloak:latest` | 8080 | `/realms/master` |
| **PostgreSQL** | `postgres:16-alpine` | 5432 | - |
| **Prometheus** | `prom/prometheus:latest` | 9090 | - |

---

## Secrets et ConfigMap requis

Les manifestes attendent ces objets dans le namespace cible avant le deploiement :

| Objet | Type | Cles |
|-------|------|------|
| `db-credentials` | Secret | `username`, `password` |
| `keycloak-credentials` | Secret | `admin-password` |
| `postgres-init` | ConfigMap | `init.sql` |

En dev, le script `minikube-bootstrap.ps1` les cree automatiquement avec des valeurs par defaut.

---

## Depannage

| Symptome | Cause probable | Solution |
|----------|---------------|----------|
| `ErrImageNeverPull` | Images absentes de Minikube | Executer `.\infra\k8s\minikube-load-images.ps1` |
| `ImagePullBackOff` | Registry inaccessible (staging/prod) | Verifier `imagePullSecrets` et acces au registry |
| `CrashLoopBackOff` sur backend | Postgres pas encore pret | Attendre : `kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s` |
| `CrashLoopBackOff` sur keycloak | Postgres pas encore pret | Meme chose ; keycloak demarre apres postgres |
| Ingress ne repond pas (Windows) | Tunnel non demarre | Lancer `minikube tunnel` dans un PowerShell admin |
| Ingress ne repond pas (DNS) | Fichier hosts pas a jour | Ajouter `127.0.0.1  marketplace.local` dans `hosts` |
| Pod prometheus en `ContainerCreating` | ConfigMap `prometheus-config` manquant | Creer le ConfigMap ou ignorer (monitoring optionnel) |
