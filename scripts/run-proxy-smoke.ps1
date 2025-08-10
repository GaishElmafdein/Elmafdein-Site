<#!
Automates:
 1) Ensure GitHub CLI installed
 2) Auth login (if needed)
 3) Prompt (or use env) for Vercel preview URL
 4) Store secret VERCEL_PREVIEW_URL
 5) Trigger workflow (.github/workflows/proxy-check.yml)
 6) Show latest run

Usage examples:
  pwsh -NoProfile -File scripts/run-proxy-smoke.ps1
  $env:VERCEL_PREVIEW_URL="https://your-app.vercel.app"; pwsh -NoProfile -File scripts/run-proxy-smoke.ps1
#>
param(
  [string]$Repo = "GaishElmafdein/Elmafdein-Site",
  [string]$WorkflowName = "Proxy smoke (Vercel preview)",
  [string]$WorkflowFile = ".github/workflows/proxy-check.yml",
  [switch]$ForceAuth,
  [switch]$SkipSecret
)

$ErrorActionPreference = "Stop"
Write-Host "== Proxy Smoke Workflow Trigger ==" -ForegroundColor Cyan
Write-Host "Repository: $Repo" -ForegroundColor DarkCyan

# 1) Ensure gh exists
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Installing GitHub CLI via winget..." -ForegroundColor Yellow
  winget install -e --id GitHub.cli --source winget | Out-Null
}

# 2) Auth
$needAuth = $ForceAuth.IsPresent
if (-not $needAuth) {
  try { gh auth status 1>$null 2>$null } catch { $needAuth = $true }
}
if ($needAuth) {
  Write-Host "Logging into GitHub CLI..." -ForegroundColor Yellow
  gh auth login --web --hostname github.com
}

# 3) Acquire preview URL
$url = $env:VERCEL_PREVIEW_URL
if (-not $url) {
  $url = Read-Host "ادخل رابط Vercel (مثال: https://your-app.vercel.app)"
}
if (-not $url) { throw "لا يوجد URL صالح." }

# Normalize (trim trailing slash)
$url = $url.TrimEnd('/')

# 4) Secret set
if (-not $SkipSecret) {
  Write-Host "Setting secret VERCEL_PREVIEW_URL=$url" -ForegroundColor Yellow
  gh secret set VERCEL_PREVIEW_URL --repo $Repo --body "$url"
  Write-Host "✅ تم حفظ السر VERCEL_PREVIEW_URL" -ForegroundColor Green
} else {
  Write-Host "Skipping secret update (SkipSecret)." -ForegroundColor Yellow
}

# 5) Trigger workflow
Write-Host "Triggering workflow..." -ForegroundColor Yellow
$wfExists = $false
try {
  gh api repos/$Repo/contents/$WorkflowFile -q .path 1>$null 2>$null
  if ($LASTEXITCODE -eq 0) { $wfExists = $true }
} catch { }

if ($wfExists) {
  gh workflow run $WorkflowFile --repo $Repo --ref main | Out-Null
  Write-Host "🚀 Ran by file: $WorkflowFile" -ForegroundColor Green
} else {
  gh workflow run "$WorkflowName" --repo $Repo --ref main | Out-Null
  Write-Host "🚀 Ran by name: $WorkflowName" -ForegroundColor Green
}

# 6) Show latest run after short wait
Start-Sleep -Seconds 5
Write-Host "Latest run:" -ForegroundColor Cyan
try {
  gh run list --repo $Repo --limit 1
} catch { Write-Host "Could not list runs yet (may still be provisioning)." -ForegroundColor DarkYellow }

Write-Host "Done." -ForegroundColor Cyan
