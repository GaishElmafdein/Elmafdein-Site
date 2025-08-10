$running = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -First 1
if(-not $running){
  Start-Process powershell -ArgumentList '-NoExit','-NoProfile','-Command','cd backend; $env:PLAYWRIGHT_BROWSERS_PATH="0"; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --log-level warning' | Out-Null
  Start-Sleep -Seconds 6
}
try {
  (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health -TimeoutSec 12).Content
} catch {
  'HEALTH_ERROR: ' + $_.Exception.Message
}
