$ErrorActionPreference = 'Stop'

# Ensure backend running
$backendListening = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -First 1
if(-not $backendListening){
  Start-Process powershell -ArgumentList '-NoExit','-NoProfile','-Command','cd backend; $env:PLAYWRIGHT_BROWSERS_PATH="0"; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --log-level warning' | Out-Null
  Start-Sleep -Seconds 6
}

# Backend /health
try { $backendHealth = (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health -TimeoutSec 15).Content } catch { $backendHealth = "HEALTH_ERROR: $($_.Exception.Message)" }

# Backend library query (didache)
try {
  $full = (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/api/library?q=didache' -TimeoutSec 95).Content
  if($full.Length -gt 200){ $libResp = $full.Substring(0,200) } else { $libResp = $full }
} catch {
  $libResp = "LIB_ERROR: $($_.Exception.Message)"
}

# Ensure frontend running
$frontendListening = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if(-not $frontendListening){
  Start-Process powershell -ArgumentList '-NoExit','-NoProfile','-Command','cd gaish-elmafdein-nextjs; npm run dev' | Out-Null
  Start-Sleep -Seconds 8
}

# Frontend health backend_reachable line
try {
  $frontendHealthRaw = (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/health -TimeoutSec 15).Content
  $backendReachableLine = ($frontendHealthRaw | Select-String 'backend_reachable').ToString()
} catch {
  $backendReachableLine = "FRONTEND_ERROR: $($_.Exception.Message)"
}

Write-Output '===RESULT_BACKEND_HEALTH===' 
Write-Output $backendHealth
Write-Output '===RESULT_LIBRARY_200===' 
Write-Output $libResp
Write-Output '===RESULT_FRONTEND_BACKEND_REACHABLE===' 
Write-Output $backendReachableLine
