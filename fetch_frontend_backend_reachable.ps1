try {
  $content = (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/health -TimeoutSec 12).Content
  $line = $content | Select-String 'backend_reachable'
  $line.ToString()
} catch {
  'FRONTEND_ERROR: ' + $_.Exception.Message
}
