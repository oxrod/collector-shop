$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$SiegeConf = Join-Path $ScriptDir "siege.conf"
$ResultsDir = Join-Path $ScriptDir "results"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

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

    $output = & wsl siege `
        --rc="$($SiegeConf -replace '\\', '/')" `
        -c $Concurrent `
        -t $Duration `
        -f "$($UrlsFile -replace '\\', '/')" `
        --log="$($LogFile -replace '\\', '/')" 2>&1

    $output | Tee-Object -FilePath $OutputFile
    Write-Host ""
    Write-Host "Results saved to: $LogFile"
}

Print-Header "Collector Shop - Siege Load Tests"
Write-Host "Timestamp: $Timestamp"
Write-Host "Results directory: $ResultsDir"

$PublicUrls = Join-Path $ScriptDir "urls-public.txt"
$StressUrls = Join-Path $ScriptDir "urls-stress.txt"
$MicroUrls = Join-Path $ScriptDir "urls-microservices.txt"

Run-Scenario -Name "baseline" -Concurrent $BaselineConcurrent -Duration $BaselineTime -UrlsFile $PublicUrls
Run-Scenario -Name "load" -Concurrent $LoadConcurrent -Duration $LoadTime -UrlsFile $PublicUrls
Run-Scenario -Name "stress" -Concurrent $StressConcurrent -Duration $StressTime -UrlsFile $StressUrls

try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3002/health" -TimeoutSec 3 -ErrorAction Stop
    Run-Scenario -Name "microservices" -Concurrent $MicroConcurrent -Duration $MicroTime -UrlsFile $MicroUrls
} catch {
    Write-Host ""
    Write-Host "[SKIP] Microservices not reachable - skipping microservices scenario"
}

Print-Header "All scenarios completed"
Write-Host "Results in: $ResultsDir"
Write-Host ""
Get-ChildItem -Path $ResultsDir -Filter "*$Timestamp*" | Format-Table Name, Length, LastWriteTime
