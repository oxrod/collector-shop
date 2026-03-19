# Bootstrap Argo CD on Minikube and register local apps (multi-app).
# Run from repo root: .\infra\k8s\minikube-argocd-bootstrap.ps1

param(
    [string]$RepoUrl = "https://github.com/oxrod/collector-shop.git",
    [string]$RepoUsername,
    [string]$RepoToken
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$projectManifest = Join-Path $repoRoot "infra\k8s\argocd\project.yaml"
$appsDirectory = Join-Path $repoRoot "infra\k8s\argocd\apps"

Write-Host "Checking kubectl context..."
$currentContext = (kubectl config current-context).Trim()
if ($currentContext -ne "minikube") {
    throw "Current kubectl context is '$currentContext'. Switch to 'minikube' before running this script."
}

if (($RepoUsername -and -not $RepoToken) -or (-not $RepoUsername -and $RepoToken)) {
    throw "Provide both -RepoUsername and -RepoToken for private repositories, or provide neither for public repositories."
}

Write-Host "Creating namespace 'argocd' (if needed)..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Installing Argo CD (server-side apply to avoid CRD annotation size limit)..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts

Write-Host "Waiting for Argo CD components..."
kubectl -n argocd rollout status deployment/argocd-server --timeout=300s
kubectl -n argocd rollout status deployment/argocd-repo-server --timeout=300s
kubectl -n argocd rollout status statefulset/argocd-application-controller --timeout=300s

if ($RepoUsername -and $RepoToken) {
    Write-Host "Registering Git repository credentials in Argo CD..."
    kubectl -n argocd create secret generic repo-collector-shop `
        --from-literal=type=git `
        --from-literal=url=$RepoUrl `
        --from-literal=name=collector-shop `
        --from-literal=username=$RepoUsername `
        --from-literal=password=$RepoToken `
        --dry-run=client -o yaml | kubectl apply -f -
    kubectl -n argocd label secret repo-collector-shop argocd.argoproj.io/secret-type=repository --overwrite

    Write-Host "Creating GHCR pull secret (ghcr-credentials) for namespaces..."
    $namespaces = @("default", "staging", "production")
    foreach ($ns in $namespaces) {
        kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
        kubectl -n $ns create secret docker-registry ghcr-credentials `
            --docker-server=ghcr.io `
            --docker-username=$RepoUsername `
            --docker-password=$RepoToken `
            --docker-email="none" `
            --dry-run=client -o yaml | kubectl apply -f -
    }
}

Write-Host "Applying repository-managed Argo CD project and applications..."
kubectl apply -f $projectManifest
kubectl apply -f $appsDirectory

Write-Host "Cleaning legacy app-of-apps root application (if present)..."
kubectl -n argocd delete application marketplace-root --ignore-not-found

Write-Host ""
Write-Host "Argo CD bootstrap complete."
Write-Host "Access UI:"
Write-Host "  kubectl -n argocd port-forward svc/argocd-server 8081:443"
Write-Host "  then open https://localhost:8081"
Write-Host ""
Write-Host "Get initial admin password:"
Write-Host '  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | % { [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) }'
Write-Host ""
Write-Host "If your repository is private, rerun with credentials:"
Write-Host "  .\infra\k8s\minikube-argocd-bootstrap.ps1 -RepoUrl $RepoUrl -RepoUsername <github-user> -RepoToken <github-pat>"
