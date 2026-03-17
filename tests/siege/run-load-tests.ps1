$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$SiegeConf = Join-Path $ScriptDir "siege.conf"
$ResultsDir = Join-Path $ScriptDir "results"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

$BackendUrl = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "http://localhost:3001" }
$FraudUrl = if ($env:FRAUD_URL) { $env:FRAUD_URL } else { "http://localhost:3002" }
$NotificationUrl = if ($env:NOTIFICATION_URL) { $env:NOTIFICATION_URL } else { "http://localhost:3003" }
$SiegeHeader = if ($env:SIEGE_HEADER) { $env:SIEGE_HEADER } else { "" }
$GatewayMode = if ($env:GATEWAY_MODE -eq "true") { $true } else { $false }

$BaselineConcurrent = if ($env:BASELINE_CONCURRENT) { $env:BASELINE_CONCURRENT } else { "25" }
$BaselineTime = if ($env:BASELINE_TIME) { $env:BASELINE_TIME } else { "60S" }
$LoadConcurrent = if ($env:LOAD_CONCURRENT) { $env:LOAD_CONCURRENT } else { "100" }
$LoadTime = if ($env:LOAD_TIME) { $env:LOAD_TIME } else { "120S" }
$StressConcurrent = if ($env:STRESS_CONCURRENT) { $env:STRESS_CONCURRENT } else { "250" }
$StressTime = if ($env:STRESS_TIME) { $env:STRESS_TIME } else { "60S" }
$MicroConcurrent = if ($env:MICRO_CONCURRENT) { $env:MICRO_CONCURRENT } else { "50" }
$MicroTime = if ($env:MICRO_TIME) { $env:MICRO_TIME } else { "60S" }

if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}

function Print-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================"
    Write-Host "  $Title"
    Write-Host "============================================"
    Write-Host ""
}

function Run-Scenario {
    param(
        [string]$Name,
        [string]$Concurrent,
        [string]$Duration,
        [string]$UrlsFile
    )

    $LogFile = Join-Path $ResultsDir "${Name}_${Timestamp}.log"
    $OutputFile = Join-Path $ResultsDir "${Name}_${Timestamp}_output.txt"

    Print-Header "$Name - $Concurrent concurrent users / $Duration"

    $headerArgs = @()
    if ($SiegeHeader) {
        $headerArgs = @("--header=`"$SiegeHeader`"")
    }

    $output = & wsl siege `
        --rc="$($SiegeConf -replace '\\', '/')" `
        -c $Concurrent `
        -t $Duration `
        -f "$($UrlsFile -replace '\\', '/')" `
        --log="$($LogFile -replace '\\', '/')" `
        @headerArgs 2>&1

    $output | Tee-Object -FilePath $OutputFile
    Write-Host ""
    Write-Host "Results saved to: $LogFile"
}

$PublicUrls = Join-Path $ResultsDir "urls-public-gen.txt"
$StressUrls = Join-Path $ResultsDir "urls-stress-gen.txt"
$MicroUrls = Join-Path $ResultsDir "urls-microservices-gen.txt"

if ($GatewayMode) {
    @"
${BackendUrl}/
${BackendUrl}/api/health
${BackendUrl}/api/articles
${BackendUrl}/api/categories
${BackendUrl}/api/shops
${BackendUrl}/api/metrics
${BackendUrl}/auth
"@ | Set-Content -Path $PublicUrls

    @"
${BackendUrl}/
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/categories
${BackendUrl}/api/shops
${BackendUrl}/auth
"@ | Set-Content -Path $StressUrls
} else {
    @"
${BackendUrl}/api/health
${BackendUrl}/api/articles
${BackendUrl}/api/categories
${BackendUrl}/api/shops
${BackendUrl}/api/metrics
"@ | Set-Content -Path $PublicUrls

    @"
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/articles
${BackendUrl}/api/categories
"@ | Set-Content -Path $StressUrls
}

@"
${FraudUrl}/health
${NotificationUrl}/health
${FraudUrl}/metrics
${NotificationUrl}/metrics
"@ | Set-Content -Path $MicroUrls

Print-Header "Collector Shop - Siege Load Tests"
Write-Host "Timestamp: $Timestamp"
Write-Host "Target:    $BackendUrl"
if ($SiegeHeader) { Write-Host "Header:    $SiegeHeader" }
if ($GatewayMode) { Write-Host "Mode:      GATEWAY (full infrastructure)" }
Write-Host "Results:   $ResultsDir"

Run-Scenario -Name "baseline" -Concurrent $BaselineConcurrent -Duration $BaselineTime -UrlsFile $PublicUrls
Run-Scenario -Name "load" -Concurrent $LoadConcurrent -Duration $LoadTime -UrlsFile $PublicUrls
Run-Scenario -Name "stress" -Concurrent $StressConcurrent -Duration $StressTime -UrlsFile $StressUrls

try {
    $healthCheck = Invoke-RestMethod -Uri "${FraudUrl}/health" -TimeoutSec 3 -ErrorAction Stop
    Run-Scenario -Name "microservices" -Concurrent $MicroConcurrent -Duration $MicroTime -UrlsFile $MicroUrls
} catch {
    Write-Host ""
    Write-Host "[SKIP] Microservices not reachable - skipping microservices scenario"
}

Print-Header "All scenarios completed"
Write-Host "Results in: $ResultsDir"
Write-Host ""
Get-ChildItem -Path $ResultsDir -Filter "*$Timestamp*" | Format-Table Name, Length, LastWriteTime
