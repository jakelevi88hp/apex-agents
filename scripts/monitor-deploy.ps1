param(
  [int]$PrNumber = 38,
  [string]$Repo = 'jakelevi88hp/apex-agents',
  [int]$IntervalSeconds = 300,
  [int]$DurationHours = 24
)

$logDir = Join-Path $PSScriptRoot '..\logs'
if (-not (Test-Path $logDir)) { New-Item -Path $logDir -ItemType Directory | Out-Null }
$logFile = Join-Path $logDir 'deploy-monitor.log'

"=== Deploy monitor started: $(Get-Date -Format o) ===" | Out-File -FilePath $logFile -Encoding utf8 -Append
"Monitoring PR #$PrNumber in repo $Repo for $DurationHours hours (interval: $IntervalSeconds s)" | Out-File -FilePath $logFile -Append

$endTime = (Get-Date).AddHours($DurationHours)
while ((Get-Date) -lt $endTime) {
  try {
    $ts = Get-Date -Format o
    "\n---- $ts ----" | Out-File -FilePath $logFile -Append
    "-- gh pr view -- checks summary --" | Out-File -FilePath $logFile -Append
    gh pr checks $PrNumber --repo $Repo 2>&1 | Out-File -FilePath $logFile -Append

    "-- gh pr view (json) --" | Out-File -FilePath $logFile -Append
    gh pr view $PrNumber --repo $Repo --json number,url,title,headRefName,baseRefName,mergeStateStatus 2>&1 | Out-File -FilePath $logFile -Append

    # If vercel CLI available, append recent logs for project
    $vercelExists = (Get-Command vercel -ErrorAction SilentlyContinue) -ne $null
    if ($vercelExists) {
      "-- vercel deployments (recent) --" | Out-File -FilePath $logFile -Append
      vercel deployments list --project apex-agents 2>&1 | Out-File -FilePath $logFile -Append
      "-- vercel logs (last 5m) --" | Out-File -FilePath $logFile -Append
      vercel logs apex-agents --since 5m 2>&1 | Out-File -FilePath $logFile -Append
    } else {
      "vercel CLI not available; skipping vercel logs" | Out-File -FilePath $logFile -Append
    }
  } catch {
    "Monitor error: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append
  }
  Start-Sleep -Seconds $IntervalSeconds
}

"=== Deploy monitor finished: $(Get-Date -Format o) ===" | Out-File -FilePath $logFile -Append
