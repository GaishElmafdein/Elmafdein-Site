param(
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 3000
)
$ErrorActionPreference = 'Stop'
Write-Host "== Gaish Elmafdein Local Dev Boot =="

# 1. Backend venv ensure
if(-not (Test-Path backend/.venv/Scripts/Activate.ps1)){
  Write-Host "Creating Python venv..." -ForegroundColor Cyan
  python -m venv backend/.venv
}

# 2. Install backend deps (skip if already installed marker)
$reqHash = (Get-FileHash backend/requirements.txt).Hash
$marker = "backend/.venv/.deps_$reqHash"
if(-not (Test-Path $marker)){
  Write-Host "Installing backend requirements..." -ForegroundColor Cyan
  backend/.venv/Scripts/python -m pip install --upgrade pip --quiet
  backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
  New-Item -ItemType File -Path $marker -Force | Out-Null
}

# 3. Playwright browsers (chromium)
$pwDir = "$env:USERPROFILE\AppData\Local\ms-playwright"
if(-not (Test-Path "$pwDir\chromium")){
  Write-Host "Installing Playwright chromium..." -ForegroundColor Cyan
  backend/.venv/Scripts/python -m playwright install chromium
}

# 4. Start backend
Write-Host "Starting backend on port $BackendPort..." -ForegroundColor Yellow
$backendProc = Start-Process -FilePath backend/.venv/Scripts/python.exe -ArgumentList '-m','uvicorn','main:app','--host','127.0.0.1','--port',$BackendPort,'--log-level','warning' -WorkingDirectory backend -PassThru

# 5. Wait for /health
$healthUrl = "http://127.0.0.1:$BackendPort/health"
for($i=1;$i -le 25;$i++){
  Start-Sleep -Milliseconds 400
  try {
    $resp = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 2
    if($resp.ok){ Write-Host "Backend healthy (#$i)" -ForegroundColor Green; break }
  } catch {}
  if($i -eq 25){ Write-Warning "Backend did not become healthy in time." }
}

# 6. Frontend deps
if(-not (Test-Path gaish-elmafdein-nextjs/node_modules)){
  Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
  Push-Location gaish-elmafdein-nextjs
  npm install --no-audit --no-fund
  Pop-Location
}

# 7. Start frontend
Write-Host "Starting frontend on port $FrontendPort..." -ForegroundColor Yellow
$env:NEXT_PUBLIC_API_BASE = "http://127.0.0.1:$BackendPort"
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:$FrontendPort"
$frontendProc = Start-Process -FilePath npm -ArgumentList 'run','dev','--','-p',"$FrontendPort" -WorkingDirectory gaish-elmafdein-nextjs -PassThru

Write-Host "== Running ==" -ForegroundColor Green
Write-Host "Backend PID: $($backendProc.Id) -> http://127.0.0.1:$BackendPort/health"
Write-Host "Frontend PID: $($frontendProc.Id) -> http://localhost:$FrontendPort/"
Write-Host "Press ENTER to stop both..."
[Console]::ReadLine() | Out-Null

# 8. Cleanup
Write-Host "Stopping processes..." -ForegroundColor Yellow
foreach($p in @($frontendProc,$backendProc)){ try { if($p -and -not $p.HasExited){ Stop-Process -Id $p.Id -Force } } catch {} }
Write-Host "Done." -ForegroundColor Green
