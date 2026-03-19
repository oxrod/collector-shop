# Apply Kustomize overlay and cleanly restart all workloads to pick up new configuration.
# Run from repo root: .\infra\k8s\apply-and-restart.ps1 -Overlay dev
# Or: .\infra\k8s\apply-and-restart.ps1 -Overlay staging
# Or: .\infra\k8s\apply-and-restart.ps1 -Overlay production

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("dev", "staging", "production")]
    [string]$Overlay
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$overlayPath = Join-Path $PSScriptRoot "overlays\$Overlay"

$namespaces = @{ dev = "default"; staging = "staging"; production = "production" }
$ns = $namespaces[$Overlay]

Write-Host "Applying overlay: $Overlay (namespace: $ns)..."
Push-Location $repoRoot
try {
    kubectl apply -k $overlayPath
    if ($LASTEXITCODE -ne 0) { throw "kubectl apply failed" }
} finally {
    Pop-Location
}

# One-time migration: if Keycloak was previously a Deployment, remove it so the StatefulSet can own the name
Write-Host "Checking for legacy Keycloak Deployment..."
$deploy = kubectl get deployment keycloak -n $ns 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Removing legacy Deployment/keycloak (replaced by StatefulSet)..."
    kubectl delete deployment keycloak -n $ns --ignore-not-found
}

Write-Host "Rolling restart of workloads..."
$workloads = @(
    "statefulset/keycloak",
    "deployment/postgres",
    "deployment/backend",
    "deployment/frontend",
    "deployment/fraud-service",
    "deployment/notification-service",
    "deployment/prometheus"
)
foreach ($w in $workloads) {
    $kind = $w.Split("/")[0]
    $name = $w.Split("/")[1]
    $exists = kubectl get $w -n $ns 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Restarting $w..."
        kubectl rollout restart $w -n $ns
        kubectl rollout status $w -n $ns --timeout=300s
    }
}

Write-Host "Done. All workloads restarted with new configuration."
